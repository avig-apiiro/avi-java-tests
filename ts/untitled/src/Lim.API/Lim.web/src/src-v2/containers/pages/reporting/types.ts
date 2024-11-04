type LastEditInfo = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  timestamp: string;
};

type Creator = {
  email: string;
  first_name: string;
  last_login: string;
  is_qbnewb: boolean;
  is_superuser: boolean;
  id: number;
  last_name: string;
  date_joined: string;
  common_name: string;
};

export interface MetabaseCollection {
  name: string;
  description: null | string;
  created_at: string;
}

export interface MetabaseDashboard {
  name: string;
  description: null | string;
  created_at: string;
  dashcards: { name: string }[];
}

export interface MetabaseReport {
  name: string;
  description: null | string;
  archived: boolean;
  collection_position: null | number;
  creator: Creator;
  enable_embedding: boolean;
  collection_id: number;
  show_in_getting_started: boolean;
  caveats: null | string;
  creator_id: number;
  updated_at: string;
  made_public_by_id: null | number;
  embedding_params: null | string;
  cache_ttl: null | number;
  id: number;
  position: null | string;
  entity_id: string;
  'last-edit-info': LastEditInfo;
  parameters: any[];
  auto_apply_filters: boolean;
  created_at: string;
  public_uuid: null | string;
  points_of_interest: null | any;
}
