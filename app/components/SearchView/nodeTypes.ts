import MainNode from '../nodes/MainNode';
import { ChatNode } from '../nodes/ChatNode';
import { NoteNode } from '../nodes/NoteNode';
import { QueryNode } from '../nodes/QueryNode';

export const nodeTypes = {
  mainNode: MainNode,
  chat: ChatNode,
  note: NoteNode,
  query: QueryNode,
};
