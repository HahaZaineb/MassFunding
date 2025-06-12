import { Args, Result, Serializable } from '@massalabs/as-types';

// Update ProjectUpdate class to add image field
export class ProjectUpdate implements Serializable {
  public id: string;
  public date: string;
  public title: string;
  public content: string;
  public author: string;
  public image: string; // New field

  constructor() {
    this.id = '';
    this.date = '';
    this.title = '';
    this.content = '';
    this.author = '';
    this.image = '';
  }

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.date)
      .add(this.title)
      .add(this.content)
      .add(this.author)
      .add(this.image)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.id = args.nextString().expect('Failed to deserialize update ID');
    this.date = args.nextString().expect('Failed to deserialize update date');
    this.title = args.nextString().expect('Failed to deserialize update title');
    this.content = args
      .nextString()
      .expect('Failed to deserialize update content');
    this.author = args
      .nextString()
      .expect('Failed to deserialize update author');
    this.image = args.nextString().expect('Failed to deserialize update image');
    return new Result(args.offset);
  }
}
