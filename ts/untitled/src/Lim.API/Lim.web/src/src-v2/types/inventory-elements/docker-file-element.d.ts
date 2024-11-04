import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface InvolvedModule {
  key: string;
  root: string;
  name: string;
}

export interface DockerFileElement extends BaseElement {
  involvedModules: InvolvedModule[];
  baseDockerImages: string[];
  exposedPorts: string[];
  relatedDockerImageNames: string[];
  users: string[];
}
