import { Serializable, Args, DeserializedResult } from '@massalabs/massa-web3';

export class ProjectUpdate implements Serializable<ProjectUpdate> {
  constructor(
    public id: string = '',
    public date: string = '',
    public title: string = '',
    public content: string = '',
    public author: string = '',
    public image: string = ''
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addString(this.id)
      .addString(this.date)
      .addString(this.title)
      .addString(this.content)
      .addString(this.author)
      .addString(this.image);
    return args.serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<ProjectUpdate> {
    const args = new Args(data, offset);
    this.id = args.nextString();
    this.date = args.nextString();
    this.title = args.nextString();
    this.content = args.nextString();
    this.author = args.nextString();
    this.image = args.nextString();
    return { instance: this, offset: args.getOffset() };
  }
}
