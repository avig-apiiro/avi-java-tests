import _ from 'lodash';
import { severityItems } from '@src-v2/containers/manual-findings/form/components/severity-select';
import {
  FindingFormValues,
  Tag,
} from '@src-v2/containers/manual-findings/form/manual-finding-creation-form';
import { FindingAssets } from '@src-v2/containers/manual-findings/form/sections/assets-findings-section';
import {
  fields,
  findingStatus,
} from '@src-v2/containers/manual-findings/form/sections/new-finding-section';
import { ActorRequest, AssetRequest, ManualFindingRequest } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';

const tagsObjectToTagsArray = (tags: object) =>
  Object.entries(tags || {}).map(([tagKey, tagValue]) => ({ tagKey, tagValue }));

const tagsArrayToTagsObject = (tagsArray: Tag[]) =>
  _.fromPairs(tagsArray.filter(tag => Boolean(tag.tagKey)).map(tag => [tag.tagKey, tag.tagValue]));

export const convertFindingToFormValues = (finding: ManualFindingRequest) => {
  const {
    title,
    description,
    discoveredOn,
    impact,
    remediation,
    cvss,
    status,
    severity,
    assets,
    globalIssueIdentifiers,
    actors,
    reportName,
    tags,
    evidencesGeneral,
    evidencesHttpRequest,
    links,
  } = finding;

  const assetFindings = assets?.map(asset => {
    const tags = tagsObjectToTagsArray(asset.tags);
    const IPAddress = asset.ips.map(value => ({ label: value, value }));

    return {
      role: asset.role === 'Subject' ? 'Affected' : asset.role,
      name:
        asset.type === 'Application' || asset.type === 'Repository'
          ? { name: asset.name }
          : asset.name,
      type: { label: asset.type, value: asset.type },
      importance:
        asset.importance !== 'NoData' ? { label: asset.importance, value: asset.importance } : '',
      IPAddress,
      tags,
      dataModelId: asset.dataModelId,
    };
  });

  const globalIdentifiers = globalIssueIdentifiers?.reduce(
    (acc, item) => {
      const key = item.type === 'Cwe' ? 'cweGlobalIdentifiers' : 'cveGlobalIdentifiers';
      const identifier =
        item.type === 'Cwe'
          ? { cwe: `${item.type.toLowerCase()}-${item.identifier}` }
          : { cve: item.identifier };

      acc[key] = acc[key] || [];
      acc[key].push(identifier);

      return acc;
    },
    { cweGlobalIdentifiers: [], cveGlobalIdentifiers: [] }
  );

  const additionalFields = fields.reduce((acc, field) => {
    if (
      Object.keys(finding).includes(field.key) &&
      !_.isEmpty(finding[field.key as keyof ManualFindingRequest])
    ) {
      acc.push(field);
    } else if (field.key === 'assignee' || field.key === 'reporter') {
      const actor = finding.actors?.find(actor => actor.role.toLowerCase() === field.key);
      if (actor) {
        acc.push({ ...field, value: actor });
      }
    }
    return acc;
  }, []);

  return {
    additionalFields,
    newFinding: {
      title,
      description,
      discoveredOn: discoveredOn && new Date(discoveredOn).toISOString().substring(0, 10),
      impact,
      severity: severity
        ? {
            key: severity,
            label: severity,
            icon: severityItems.find(severityItem => severityItem.key === severity)?.icon,
          }
        : severityItems[0],
      status: status
        ? {
            label: status,
            value: status,
          }
        : findingStatus[0],
      remediation: remediation?.description,
      cvss: cvss
        ? { ...cvss, version: { label: cvss.version, value: cvss.version } }
        : {
            version: {
              label: '3.1',
              value: '3.1',
            },
          },
      evidence: {
        httpMethod: 'GET',
      },
      assignee: actors?.find(actor => actor.role === 'Assignee')?.name,
      reporter: actors?.find(actor => actor.role === 'Reporter')?.name,
      reportName,
      tags: tagsObjectToTagsArray(tags),
      evidenceDescription: _.isEmpty(evidencesGeneral) ? null : evidencesGeneral[0].description,
      evidenceHttpRequest: _.isEmpty(evidencesHttpRequest)
        ? null
        : {
            ...evidencesHttpRequest[0],
            method: {
              label: evidencesHttpRequest[0].method,
              value: evidencesHttpRequest[0].method,
            },
          },
      links: (links || []).map(url => ({ value: url, label: url })),
    },
    globalIdentifiers: {
      cveGlobalIdentifiers: globalIdentifiers?.cveGlobalIdentifiers?.length
        ? globalIdentifiers.cveGlobalIdentifiers
        : [{ cve: '' }],
      cweGlobalIdentifiers: globalIdentifiers?.cweGlobalIdentifiers?.length
        ? globalIdentifiers.cweGlobalIdentifiers
        : [{ cwe: '' }],
    },
    assetFindings: assetFindings ?? [
      {
        role: FindingAssets.AffectedAsset,
        type: { label: 'URL', value: 'URL' },
      },
    ],
  };
};

const createEvidenceHttpRequest = (evidenceHttpRequest: {
  method: { value: string; label: string };
  url: string;
}) => {
  return {
    url: evidenceHttpRequest.url,
    method: evidenceHttpRequest.method.value,
    headers: [] as StubAny[],
  };
};

export const convertFormValuesToFinding = ({
  newFinding: {
    assignee,
    title,
    description,
    discoveredOn,
    impact,
    remediation,
    reporter,
    cvss,
    status,
    severity,
    tags,
    reportName,
    evidenceDescription,
    evidenceHttpRequest,
    links,
  },
  assetFindings,
  globalIdentifiers: { cveGlobalIdentifiers, cweGlobalIdentifiers },
}: FindingFormValues): ManualFindingRequest => {
  const actors: ActorRequest[] = [];

  if (assignee) {
    actors.push({ name: assignee, role: 'Assignee', email: '', isStaff: null });
  }
  if (reporter) {
    actors.push({ name: reporter, role: 'Reporter', email: '', isStaff: null });
  }

  const cweIdentifiers =
    cweGlobalIdentifiers
      ?.filter(cwe => Boolean(cwe.cwe))
      .map(cweRecord => ({
        type: 'CWE',
        identifier: cweRecord.cwe,
      })) || [];

  const cveIdentifiers =
    cveGlobalIdentifiers
      ?.filter(cve => Boolean(cve.cve))
      .map(cveRecord => ({
        type: 'CVE',
        identifier: cveRecord.cve,
      })) || [];

  const assets: AssetRequest[] = assetFindings.map(asset => {
    const type = typeof asset.type === 'string' ? asset.type : asset.type.value;
    return {
      role: asset.role === 'Affected' ? 'Subject' : asset.role,
      name:
        (type === 'Repository' || type === 'Application') && typeof asset.name === 'object'
          ? asset.name.name
          : (asset.name as string),
      dataModelId: asset.dataModelId
        ? asset.dataModelId
        : type !== 'Repository' && type !== 'Application'
          ? null
          : typeof asset.name === 'object' && asset.name.key,
      type,
      importance: asset.importance?.value,
      ips: asset.IPAddress?.map(pair => pair.value) || [],
      tags: tagsArrayToTagsObject(asset.tags),
    };
  });

  return {
    title,
    description,
    discoveredOn,
    severity: severity.key,
    remediation: remediation ? { description: remediation, title: '' } : null,
    status: status.value,
    impact,
    globalIssueIdentifiers: [...cweIdentifiers, ...cveIdentifiers],
    actors,
    cvss: cvss?.score ? { ...cvss, version: cvss.version.value } : null,
    assets,
    tags: tagsArrayToTagsObject(tags),
    reportName: reportName ? reportName : null,
    evidencesGeneral: evidenceDescription ? [{ description: evidenceDescription }] : [],
    evidencesHttpRequest: evidenceHttpRequest?.url
      ? [createEvidenceHttpRequest(evidenceHttpRequest)]
      : [],
    links: (links || []).map(({ value }) => value),
  };
};
