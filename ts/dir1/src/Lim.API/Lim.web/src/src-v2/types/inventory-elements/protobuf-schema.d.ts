import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface ProtobufSchema extends BaseElement {}

export interface ProtobufMessage extends ProtobufSchema {}

export interface ProtobufService extends ProtobufSchema {}
