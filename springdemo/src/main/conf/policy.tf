/**
 * Define the bucket policy based on a simplified set of directives, common among buckets.
 */

locals {
  bucket_arn      = module.bucket.bucket-arn
  bucket_wildcard = "${local.bucket_arn}/*"
  bucket_all_arns = [local.bucket_arn, local.bucket_wildcard]

  # https://docs.aws.amazon.com/code-samples/latest/catalog/iam_policies-billing-billing-report-resource-policy-grants-reports-access-to-s3.json.html
  aws_billing_account_id = "386209384616"
  # https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-supported-regions.html
  cloudtrail_accounts = [
    "086441151436", # us-east-1
    "113285607260", # us-west-2
    "216624486486", # ap-northeast-1
    "284668455005", # ap-southeast-2
    "388731089494", # us-west-1
    "814480443879", # sa-east-1
    "859597730677", # eu-west-1
    "903692715234", # ap-southeast-1
  ]
  cloudtrail_account_principals = [
    for account in local.cloudtrail_accounts :
    "arn:aws:iam::${account}:root"
  ]
  # https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-access-logs.html
  load_balancer_accounts_by_region = {
    "af-south-1"     = "098369216593"
    "ap-east-1"      = "754344448648"
    "ap-northeast-1" = "582318560864"
    "ap-northeast-2" = "600734575887"
    "ap-northeast-3" = "383597477331"
    "ap-south-1"     = "718504428378"
    "ap-southeast-1" = "114774131450"
    "ap-southeast-2" = "783225319266"
    "ap-southeast-3" = "589379963580"
    "ca-central-1"   = "985666609251"
    "eu-central-1"   = "054676820928"
    "eu-north-1"     = "897822967062"
    "eu-south-1"     = "635631232127"
    "eu-west-1"      = "156460612806"
    "eu-west-2"      = "652711504416"
    "eu-west-3"      = "009996457667"
    "me-south-1"     = "076674570225"
    "sa-east-1"      = "507241528517"
    "us-east-1"      = "127311923021"
    "us-east-2"      = "033677994240"
    "us-west-1"      = "027434742980"
    "us-west-2"      = "797873946194"
  }
  # https://docs.aws.amazon.com/redshift/latest/mgmt/db-auditing.html
  redshift_audit_accounts_by_region = {
    "us-east-1" = "193672423079"
  }

  principal_types = {
    "by_account" = "AWS"
    "by_service" = "Service"
  }

  configured_cloudtrail_paths = coalescelist(
    var.policy.grant_cloudtrail == null ? [] :
    var.policy.grant_cloudtrail.paths == null ? [] :
    var.policy.grant_cloudtrail.paths,
    ["*"]
  )

  balancer_restricted_resource = (
    var.policy.grant_balancer_access_logs == false
    ? null
    : "${local.bucket_arn}/*/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
  )
}

data "aws_iam_policy_document" "bucket-policy" {
  count = var.policy.override == null ? 1 : 0

  policy_id = var.policy.id

  #
  # Grant cloudtrail access to write to this bucket.
  # The by_account value grants access to cloudtrail's account ID.
  # The by_service value grants access to cloudtrail's service identifier.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_cloudtrail != null ? 1 : 0)

    content {
      sid = "AWSCloudTrailAclCheck"

      effect    = "Allow"
      actions   = ["s3:GetBucketAcl"]
      resources = [local.bucket_arn]

      principals {
        type        = var.policy.grant_cloudtrail.principal == "by_account" ? "AWS" : "Service"
        identifiers = var.policy.grant_cloudtrail.principal == "by_account" ? local.cloudtrail_account_principals : ["cloudtrail.amazonaws.com"]
      }
    }
  }

  dynamic "statement" {
    for_each = range(var.policy.grant_cloudtrail != null ? 1 : 0)

    content {
      sid = "AWSCloudTrailWrite"

      effect  = "Allow"
      actions = ["s3:PutObject"]
      resources = [
        for path in local.configured_cloudtrail_paths :
        (
          contains(["", "*", "/*"], path)
          ? "${local.bucket_arn}/*"
          : "${local.bucket_arn}/${trimsuffix(trimsuffix(trimprefix(path, "/"), "/"), "/*")}/*"
        )
      ]

      principals {
        type        = local.principal_types[var.policy.grant_cloudtrail.principal]
        identifiers = var.policy.grant_cloudtrail.principal == "by_account" ? local.cloudtrail_account_principals : ["cloudtrail.amazonaws.com"]
      }

      dynamic "condition" {
        for_each = range(var.policy.grant_cloudtrail.source_arn_patterns == null ? 0 : 1)
        content {
          test     = "ArnLike"
          variable = "aws:SourceArn"
          values   = sort(var.policy.grant_cloudtrail.source_arn_patterns)
        }
      }

      dynamic "condition" {
        for_each = range(var.disable_confusing_acls ? 0 : 1)
        content {
          test     = "StringEquals"
          variable = "s3:x-amz-acl"
          values   = ["bucket-owner-full-control"]
        }
      }
    }
  }

  #
  # Grant access to the specified Lambda functions (`lambdas`).
  # This can be refined by both the set of `actions` and set of `paths` to grant.
  # The account is inferred from the lambda name, which should start with the cluster group (e.g. `beta_logs_forwarder`).
  #

  dynamic "statement" {
    for_each = var.policy.grant_lambdas

    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.paths == null ? local.bucket_all_arns : [
        for path in statement.value.paths :
        "${local.bucket_arn}${path}"
      ]

      principals {
        type = "AWS"
        identifiers = [
          for lambda in statement.value.lambdas :
          "arn:aws:iam::${module.globals.accounts_by_namespace[regex("^[^_]+", lambda)]}:role/autogen_lambda_${lambda}"
        ]
      }
    }
  }

  #
  # Grant `actions` to the specified role `machines`.
  # The account is inferred from the role machine name, which should start with the cluster group (e.g. `beta_bastion`).
  #

  dynamic "statement" {
    for_each = var.policy.grant_crossaccount_machine_roles

    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.paths == null ? local.bucket_all_arns : [
        for path in statement.value.paths :
        "${local.bucket_arn}${path}"
      ]

      principals {
        type = "AWS"
        identifiers = [
          for machine_role in statement.value.machines :
          "arn:aws:iam::${module.globals.accounts_by_namespace[regex("^[^_]+", machine_role)]}:role/autogen_role_${machine_role}"
        ]
      }
    }
  }

  dynamic "statement" {
    for_each = var.policy.grant_crossaccount_github_actions_roles

    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.paths == null ? local.bucket_all_arns : [
        for path in statement.value.paths :
        "${local.bucket_arn}${path}"
      ]

      principals {
        type = "AWS"
        identifiers = [
          for github_action_role in statement.value.github_actions_roles :
          "arn:aws:iam::${module.globals.accounts_by_namespace[regex("^[^_]+", github_action_role)]}:role/autogen_github_actions_${github_action_role}"
        ]
      }
    }
  }

  #
  # Grant `actions` to the specified kubeapp roles.
  # The account is inferred from the role name, which should start with the cluster group (e.g. `beta_bastion`).
  #

  dynamic "statement" {
    for_each = var.policy.grant_crossaccount_kube_roles

    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.paths == null ? local.bucket_all_arns : [
        for path in statement.value.paths :
        "${local.bucket_arn}${path}"
      ]

      principals {
        type = "AWS"
        identifiers = [
          for kube_role in statement.value.kubeapps :
          "arn:aws:iam::${module.globals.accounts_by_namespace[regex("^[^_]+", kube_role)]}:role/autogen_kube_${kube_role}"
        ]
      }
    }
  }

  #
  # Grant `actions` to the specified cell roles.
  # We only allow access from the prod account. Only beta and prod promotional stages in Cells require access to the bucket
  # and they all run in our "prod" account.
  #
  # Each CellApp component can be associated with a specific IAM Role.  Each instance of a cell will have it's unique set
  # of IAM roles used by it's CellApp components so we need to wildcard the suffix of the IAM role since the suffix
  # contains the unique id of the cell.
  dynamic "statement" {
    for_each = var.policy.grant_crossaccount_cell_roles

    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.paths == null ? local.bucket_all_arns : [
        for path in statement.value.paths :
        "${local.bucket_arn}${path}"
      ]

      # Principals don't allow the use of wildcards so we have to allow all here and set a condition where
      # we can apply our wildcard filtering.
      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${module.globals.corp_account_id}:root"]
      }

      condition {
        test = "ArnLike"
        values = concat(
          [
            for cell_role in statement.value.cell_roles :
            # The suffix of the IAM role is the unique id of the cell the role is used by. To avoid having to
            # keep a list of all cells running in terraform and having to rerun this everytime we provision a
            # new cells or cycle/remove a cell we use a wildcard so this grant will apply to all of them.
            "arn:aws:iam::${module.globals.corp_account_id}:role/cell-${cell_role}-role-*"
          ]
        )
        variable = "aws:PrincipalArn"
      }
    }
  }

  #
  # Grant redshift write access for auditing purposes.
  #

  dynamic "statement" {
    # Compare against true to handle null.
    for_each = range(var.policy.grant_redshift_audit == true ? 1 : 0)

    content {
      effect    = "Allow"
      actions   = ["s3:GetBucketAcl", "s3:PutObject"]
      resources = local.bucket_all_arns

      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${local.redshift_audit_accounts_by_region[data.aws_region.current.name]}:user/logs"]
      }
    }
  }

  #
  # Grant load balancers in the current account write access for auditing purposes.
  # This can be refined by passing in "restricted" instead of `true` to restrict the writable paths
  # to ones matching the current account.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_balancer_access_logs == false ? 0 : 1)

    content {
      sid = "AllowELBAccessLogs"

      effect  = "Allow"
      actions = ["s3:PutObject"]
      resources = [
        var.policy.grant_balancer_access_logs == "restricted"
        ? local.balancer_restricted_resource
        : local.bucket_wildcard
      ]

      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${local.load_balancer_accounts_by_region[data.aws_region.current.name]}:root"]
      }
    }
  }

  dynamic "statement" {
    for_each = range(var.policy.grant_balancer_access_logs == false ? 0 : 1)

    content {
      sid = "AllowELBAccessLogsNewRegions"

      effect    = "Allow"
      actions   = ["s3:PutObject"]
      resources = [local.balancer_restricted_resource]

      principals {
        type = "Service"
        identifiers = [
          "logdelivery.elasticloadbalancing.amazonaws.com",
          # Per https://docs.aws.amazon.com/elasticloadbalancing/latest/application/enable-access-logging.html,
          # this is technically just for AWS Outposts, but we include it here for completeness.
          "logdelivery.elb.amazonaws.com",
        ]
      }
    }
  }

  #
  # Grant AWS billing write access to the bucket to provide billing reports.
  # The by_account value grants access to the billing reports account ID.
  # The by_service value grants access to the billing reports service identifier.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_billing != null ? 1 : 0)

    content {
      # This magic number is defined in the sample policy directive, and seems to be consistent.
      sid = var.policy.grant_billing == "by_account" ? "Stmt1335892150622" : null

      effect    = "Allow"
      actions   = ["s3:GetBucketAcl", "s3:GetBucketPolicy", "s3:PutObject"]
      resources = local.bucket_all_arns

      principals {
        type = local.principal_types[var.policy.grant_billing]
        identifiers = [
          var.policy.grant_billing == "by_account"
          ? "arn:aws:iam::${local.aws_billing_account_id}:root"
          : "billingreports.amazonaws.com"
        ]
      }
    }
  }

  #
  # Grant the AWS Logs Delivery service write access to the bucket.
  # Among other things, this supports delivery of S3 Server Access Logs and VPC Flowlogs.
  #
  # Use grant_balancer_access_logs to grant access for classic ELB logs.
  #

  dynamic "statement" {
    # Compare against true to handle null.
    for_each = range(var.policy.grant_logs_delivery == true ? 1 : 0)

    content {
      sid = "AWSLogDeliveryWrite"

      effect  = "Allow"
      actions = ["s3:PutObject"]
      # The structure of this is inconsistent - with or without the initial
      # wildcard, so we just allow both.
      resources = [
        "${local.bucket_arn}/*/AWSLogs/${data.aws_caller_identity.current.account_id}/*",
        "${local.bucket_arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*",
      ]

      principals {
        type        = "Service"
        identifiers = ["delivery.logs.amazonaws.com"]
      }

      condition {
        test     = "StringEqualsIfExists"
        variable = "s3:x-amz-acl"
        values   = ["bucket-owner-full-control"]
      }

      # Note that aws:SourceOrgID does not work with ELB logs. That's ok, because ELB logs have
      # their own weird set of policy requirements.
      # https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-sourceorgid
      # https://docs.aws.amazon.com/elasticloadbalancing/latest/application/enable-access-logging.html
      condition {
        test     = "StringEquals"
        variable = "aws:SourceOrgID"
        values   = [module.globals.organization_id]
      }
    }
  }

  dynamic "statement" {
    # Compare against true to handle null.
    for_each = range(var.policy.grant_logs_delivery == true ? 1 : 0)

    content {
      sid = "AWSLogDeliveryAclCheck"

      effect    = "Allow"
      actions   = ["s3:GetBucketAcl"]
      resources = [local.bucket_arn]

      principals {
        type        = "Service"
        identifiers = ["delivery.logs.amazonaws.com"]
      }
    }
  }

  #
  # Grant access to S3 to deliver S3 Server Access Logs to the bucket.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_s3_server_access_logs == false ? 0 : 1)

    content {
      sid = "AWSLogDeliveryWrite"

      effect    = "Allow"
      actions   = ["s3:PutObject"]
      resources = [local.bucket_wildcard]

      principals {
        type        = "Service"
        identifiers = ["logging.s3.amazonaws.com"]
      }

      condition {
        test     = "StringEqualsIfExists"
        variable = "s3:x-amz-acl"
        values   = ["bucket-owner-full-control"]
      }

      condition {
        test     = "StringEquals"
        variable = "aws:SourceOrgID"
        values   = [module.globals.organization_id]
      }
    }
  }

  dynamic "statement" {
    # Compare against true to handle null.
    for_each = range(var.policy.grant_ses == true ? 1 : 0)

    content {
      effect    = "Allow"
      actions   = ["s3:PutObject"]
      resources = [local.bucket_wildcard]

      principals {
        type        = "Service"
        identifiers = ["ses.amazonaws.com"]
      }
    }
  }

  #
  # Grant access to anything behind a particular set of VPCs, as determined by the S3 VPC endpoints
  # available in those VPCs.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_vpcs)))

    content {
      sid = "UnrestrictedVPCAccess"

      effect = "Allow"
      actions = [
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning",
        "s3:GetObject*",
        "s3:ListBucket",
        "s3:ListBucketVersions",
      ]
      resources = local.bucket_all_arns

      principals {
        type        = "*"
        identifiers = ["*"]
      }

      condition {
        test     = "StringEquals"
        variable = "aws:SourceVpc"
        values   = var.policy.grant_vpcs
      }
    }
  }

  #
  # Grant a specific set of CloudFront Origin Access Identities (OAIs) read access to the bucket.
  # Must be specified as a list/set.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_cloudfront_origin_identities)))

    content {
      sid = "OriginAccessIdentity"

      effect    = "Allow"
      actions   = ["s3:GetObject"]
      resources = [local.bucket_wildcard]

      principals {
        type = "AWS"
        identifiers = [
          for id in var.policy.grant_cloudfront_origin_identities :
          "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${id}"
        ]
      }
    }
  }

  #
  # Grant a specific set of CloudFront Distributions read access to the bucket, which requires that
  # the distributions have an Origin Access Control (OAC) associated with them.
  # Must be specified as a list/set.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_cloudfront_distributions.distribution_arns)))

    content {
      sid = "OriginAccessControl"

      effect  = "Allow"
      actions = ["s3:GetObject"]
      resources = (
        var.policy.grant_cloudfront_distributions.path_patterns == null
        ? [local.bucket_wildcard]
        : [
          for pattern in var.policy.grant_cloudfront_distributions.path_patterns :
          "${local.bucket_arn}/${trimprefix(pattern, "/")}"
        ]
      )

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      condition {
        test     = "ArnEquals"
        variable = "aws:SourceArn"
        values   = tolist(var.policy.grant_cloudfront_distributions.distribution_arns)
      }
    }
  }

  #
  # Grant the global/public/world read access to all objects in the bucket.
  # This is dangerous! You must pass "DANGEROUS_GLOBAL" in lieu of `true` to enable this.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_public_read == "DANGEROUS_GLOBAL" ? 1 : 0)

    content {
      sid = "PublicReadGetObject"

      effect    = "Allow"
      actions   = ["s3:GetObject"]
      resources = [local.bucket_wildcard]

      principals {
        type        = "*"
        identifiers = ["*"]
      }
    }
  }

  #
  # Grant read access to the staging account in AWS.
  #

  dynamic "statement" {
    for_each = range(var.policy.grant_staging_read ? 1 : 0)

    content {
      sid = "Staging access"

      effect    = "Allow"
      actions   = ["s3:GetObject", "s3:GetBucketLocation", "s3:ListBucket"]
      resources = local.bucket_all_arns

      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${module.globals.stag_account_id}:root"]
      }
    }
  }

  #
  # ##ScubaS3Access
  # Grant read/scan access to Scuba.
  # This should have a set/list of paths to expose. In lieu of a set of paths,
  # the values "*" and `true` may be provided to grant scuba access to
  # all objects in the bucket.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_scuba)))

    content {
      sid = "AllowRestrictedAccessToInteranaV4"

      effect  = "Allow"
      actions = ["s3:GetBucketLocation", "s3:GetObject"]
      resources = concat(
        [local.bucket_arn],
        contains(var.policy.grant_scuba, "*") ? [local.bucket_wildcard] : [
          for path in toset(var.policy.grant_scuba) :
          "${local.bucket_arn}/${trimsuffix(trimsuffix(trimprefix(path, "/"), "/"), "/*")}/*"
        ]
      )

      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${module.globals.scuba_account_id}:root"]
      }
    }
  }

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_scuba)))

    content {
      sid = "AllowRestrictedListBucketToInteranaV4"

      effect    = "Allow"
      actions   = ["s3:ListBucket"]
      resources = [local.bucket_arn]

      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${module.globals.scuba_account_id}:root"]
      }

      dynamic "condition" {
        for_each = range(var.policy.grant_scuba == "*" || var.policy.grant_scuba == true ? 0 : 1)

        content {
          test     = "StringLike"
          variable = "s3:prefix"
          values = [
            for path in toset(var.policy.grant_scuba) :
            "${trimsuffix(trimsuffix(trimprefix(path, "/"), "/"), "/*")}/*"
          ]
        }
      }
    }
  }

  #
  # Grant AWS S3 write access to insert inventory reports from the specified buckets.
  # The buckets must be specified in the value as a list or set.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.grant_inventory_reports)))

    content {
      sid = "S3PolicyStmt-DO-NOT-MODIFY"

      effect    = "Allow"
      actions   = ["s3:PutObject"]
      resources = [local.bucket_wildcard]

      principals {
        type        = "Service"
        identifiers = ["s3.amazonaws.com"]
      }

      condition {
        test     = "ArnLike"
        variable = "aws:SourceArn"
        values = [
          for bucket in var.policy.grant_inventory_reports :
          "arn:aws:s3:::${bucket}"
        ]
      }

      condition {
        test     = "StringEquals"
        variable = "aws:SourceAccount"
        values   = [data.aws_caller_identity.current.account_id]
      }

      condition {
        test     = "StringEquals"
        variable = "s3:x-amz-acl"
        values   = ["bucket-owner-full-control"]
      }
    }
  }

  #
  # Add manual explicit grant statements to the policy.
  #

  dynamic "statement" {
    for_each = var.policy.grant_explicit

    content {
      sid = statement.value.sid

      effect  = coalesce(statement.value.effect, "Allow")
      actions = statement.value.actions
      resources = coalesce(
        statement.value.resources,
        local.bucket_all_arns
      )

      dynamic "condition" {
        for_each = coalesce(statement.value.conditions, [])

        content {
          test     = condition.value.test
          variable = condition.value.variable
          values   = condition.value.values
        }
      }

      dynamic "principals" {
        for_each = range(statement.value.principals == null ? 0 : 1)

        content {
          type        = statement.value.principals.type
          identifiers = statement.value.principals.identifiers
        }
      }

      dynamic "not_principals" {
        for_each = range(statement.value.not_principals == null ? 0 : 1)

        content {
          type        = statement.value.not_principals.type
          identifiers = statement.value.not_principals.identifiers
        }
      }
    }
  }

  #
  # Require the x-amz-server-side-encryption header to be explicitly set when adding objects to this
  # bucket. The header must be set to "true" or "AES256".
  #

  dynamic "statement" {
    for_each = (
      var.policy.require_encryption_headers
      ? ["DenyIncorrectEncryptionHeader", "DenyUnEncryptedObjectUploads"]
      : []
    )

    content {
      sid = statement.value

      effect    = "Deny"
      actions   = ["s3:PutObject"]
      resources = [local.bucket_wildcard]

      principals {
        type        = "*"
        identifiers = ["*"]
      }

      condition {
        test     = statement.key == 0 ? "StringNotEquals" : "Null"
        variable = "s3:x-amz-server-side-encryption"
        values   = [statement.key == 0 ? "AES256" : "true"]
      }
    }
  }

  #
  # Require all PutObject requests to explicitly grant full control of the object to the bucket
  # owner. Important for cross-account s3 writes.
  #

  dynamic "statement" {
    for_each = range(signum(length(var.policy.require_full_control_from)))

    content {
      effect    = "Deny"
      actions   = ["s3:PutObject"]
      resources = [local.bucket_wildcard]

      principals {
        type = "AWS"
        identifiers = (
          contains(var.policy.require_full_control_from, "*") ? ["*"] : [
            for account in var.policy.require_full_control_from :
            "arn:aws:iam::${account}:root"
          ]
        )
      }

      condition {
        test     = "StringNotEquals"
        variable = "s3:x-amz-acl"
        values   = ["bucket-owner-full-control"]
      }
    }
  }

  #
  # Require the use of a secure transport (e.g. https) when performing any operation on the bucket.
  #

  dynamic "statement" {
    for_each = range(var.policy.require_secure_transport ? 1 : 0)

    content {
      effect    = "Deny"
      actions   = ["s3:*"]
      resources = local.bucket_all_arns

      principals {
        type        = "*"
        identifiers = ["*"]
      }

      condition {
        test     = "Bool"
        variable = "aws:SecureTransport"
        values   = ["false"]
      }
    }
  }
}

locals {
  statements = (
    length(data.aws_iam_policy_document.bucket-policy) > 0
    ? jsondecode(data.aws_iam_policy_document.bucket-policy[0].json).Statement
    : null
  )
  # Can't use coalesce with an empty list because apparently that doesn't reconcile to the same type
  # as a list containing valid statement elements.
  num_statements = local.statements == null ? 0 : length(local.statements)
}

resource "aws_s3_bucket_policy" "bucket-policy" {
  bucket = module.bucket.bucket
  policy = (
    var.policy.override == null
    ? (
      local.num_statements == 0
      ? ""
      : data.aws_iam_policy_document.bucket-policy[0].json
    )
    : var.policy.override
  )

  # If we're also creating a bucket policy, we have to wait for it to get created before the public
  # access block can get created.
  # https://github.com/hashicorp/terraform-provider-aws/issues/7628
  depends_on = [module.bucket.final-resource]
}
