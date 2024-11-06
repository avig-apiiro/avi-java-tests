export class MultipleErrors extends Error {
  public messages: string[];

  constructor(messages: string[]) {
    super(messages.join('. '));
    this.messages = messages;
  }
}
