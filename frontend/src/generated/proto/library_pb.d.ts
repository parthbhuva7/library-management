import * as jspb from 'google-protobuf'



export class Book extends jspb.Message {
  getId(): string;
  setId(value: string): Book;

  getTitle(): string;
  setTitle(value: string): Book;

  getAuthor(): string;
  setAuthor(value: string): Book;

  getIsbn(): string;
  setIsbn(value: string): Book;

  getCopyCount(): number;
  setCopyCount(value: number): Book;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Book.AsObject;
  static toObject(includeInstance: boolean, msg: Book): Book.AsObject;
  static serializeBinaryToWriter(message: Book, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Book;
  static deserializeBinaryFromReader(message: Book, reader: jspb.BinaryReader): Book;
}

export namespace Book {
  export type AsObject = {
    id: string,
    title: string,
    author: string,
    isbn: string,
    copyCount: number,
  }
}

export class BookCopy extends jspb.Message {
  getId(): string;
  setId(value: string): BookCopy;

  getBookId(): string;
  setBookId(value: string): BookCopy;

  getCopyNumber(): string;
  setCopyNumber(value: string): BookCopy;

  getStatus(): string;
  setStatus(value: string): BookCopy;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BookCopy.AsObject;
  static toObject(includeInstance: boolean, msg: BookCopy): BookCopy.AsObject;
  static serializeBinaryToWriter(message: BookCopy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BookCopy;
  static deserializeBinaryFromReader(message: BookCopy, reader: jspb.BinaryReader): BookCopy;
}

export namespace BookCopy {
  export type AsObject = {
    id: string,
    bookId: string,
    copyNumber: string,
    status: string,
  }
}

export class Member extends jspb.Message {
  getId(): string;
  setId(value: string): Member;

  getName(): string;
  setName(value: string): Member;

  getEmail(): string;
  setEmail(value: string): Member;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Member.AsObject;
  static toObject(includeInstance: boolean, msg: Member): Member.AsObject;
  static serializeBinaryToWriter(message: Member, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Member;
  static deserializeBinaryFromReader(message: Member, reader: jspb.BinaryReader): Member;
}

export namespace Member {
  export type AsObject = {
    id: string,
    name: string,
    email: string,
  }
}

export class Borrow extends jspb.Message {
  getId(): string;
  setId(value: string): Borrow;

  getCopyId(): string;
  setCopyId(value: string): Borrow;

  getMemberId(): string;
  setMemberId(value: string): Borrow;

  getBorrowedAt(): string;
  setBorrowedAt(value: string): Borrow;

  getReturnedAt(): string;
  setReturnedAt(value: string): Borrow;

  getStatus(): string;
  setStatus(value: string): Borrow;

  getCopy(): BookCopy | undefined;
  setCopy(value?: BookCopy): Borrow;
  hasCopy(): boolean;
  clearCopy(): Borrow;

  getBook(): Book | undefined;
  setBook(value?: Book): Borrow;
  hasBook(): boolean;
  clearBook(): Borrow;

  getMember(): Member | undefined;
  setMember(value?: Member): Borrow;
  hasMember(): boolean;
  clearMember(): Borrow;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Borrow.AsObject;
  static toObject(includeInstance: boolean, msg: Borrow): Borrow.AsObject;
  static serializeBinaryToWriter(message: Borrow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Borrow;
  static deserializeBinaryFromReader(message: Borrow, reader: jspb.BinaryReader): Borrow;
}

export namespace Borrow {
  export type AsObject = {
    id: string,
    copyId: string,
    memberId: string,
    borrowedAt: string,
    returnedAt: string,
    status: string,
    copy?: BookCopy.AsObject,
    book?: Book.AsObject,
    member?: Member.AsObject,
  }
}

export class PaginationRequest extends jspb.Message {
  getPage(): number;
  setPage(value: number): PaginationRequest;

  getLimit(): number;
  setLimit(value: number): PaginationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaginationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PaginationRequest): PaginationRequest.AsObject;
  static serializeBinaryToWriter(message: PaginationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaginationRequest;
  static deserializeBinaryFromReader(message: PaginationRequest, reader: jspb.BinaryReader): PaginationRequest;
}

export namespace PaginationRequest {
  export type AsObject = {
    page: number,
    limit: number,
  }
}

export class PaginationResponse extends jspb.Message {
  getPage(): number;
  setPage(value: number): PaginationResponse;

  getLimit(): number;
  setLimit(value: number): PaginationResponse;

  getTotalCount(): number;
  setTotalCount(value: number): PaginationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaginationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PaginationResponse): PaginationResponse.AsObject;
  static serializeBinaryToWriter(message: PaginationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaginationResponse;
  static deserializeBinaryFromReader(message: PaginationResponse, reader: jspb.BinaryReader): PaginationResponse;
}

export namespace PaginationResponse {
  export type AsObject = {
    page: number,
    limit: number,
    totalCount: number,
  }
}

export class CreateBookRequest extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): CreateBookRequest;

  getAuthor(): string;
  setAuthor(value: string): CreateBookRequest;

  getIsbn(): string;
  setIsbn(value: string): CreateBookRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBookRequest): CreateBookRequest.AsObject;
  static serializeBinaryToWriter(message: CreateBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBookRequest;
  static deserializeBinaryFromReader(message: CreateBookRequest, reader: jspb.BinaryReader): CreateBookRequest;
}

export namespace CreateBookRequest {
  export type AsObject = {
    title: string,
    author: string,
    isbn: string,
  }
}

export class CreateBookResponse extends jspb.Message {
  getBook(): Book | undefined;
  setBook(value?: Book): CreateBookResponse;
  hasBook(): boolean;
  clearBook(): CreateBookResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBookResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBookResponse): CreateBookResponse.AsObject;
  static serializeBinaryToWriter(message: CreateBookResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBookResponse;
  static deserializeBinaryFromReader(message: CreateBookResponse, reader: jspb.BinaryReader): CreateBookResponse;
}

export namespace CreateBookResponse {
  export type AsObject = {
    book?: Book.AsObject,
  }
}

export class UpdateBookRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateBookRequest;

  getTitle(): string;
  setTitle(value: string): UpdateBookRequest;

  getAuthor(): string;
  setAuthor(value: string): UpdateBookRequest;

  getIsbn(): string;
  setIsbn(value: string): UpdateBookRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBookRequest): UpdateBookRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBookRequest;
  static deserializeBinaryFromReader(message: UpdateBookRequest, reader: jspb.BinaryReader): UpdateBookRequest;
}

export namespace UpdateBookRequest {
  export type AsObject = {
    id: string,
    title: string,
    author: string,
    isbn: string,
  }
}

export class UpdateBookResponse extends jspb.Message {
  getBook(): Book | undefined;
  setBook(value?: Book): UpdateBookResponse;
  hasBook(): boolean;
  clearBook(): UpdateBookResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBookResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBookResponse): UpdateBookResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateBookResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBookResponse;
  static deserializeBinaryFromReader(message: UpdateBookResponse, reader: jspb.BinaryReader): UpdateBookResponse;
}

export namespace UpdateBookResponse {
  export type AsObject = {
    book?: Book.AsObject,
  }
}

export class ListBooksRequest extends jspb.Message {
  getPagination(): PaginationRequest | undefined;
  setPagination(value?: PaginationRequest): ListBooksRequest;
  hasPagination(): boolean;
  clearPagination(): ListBooksRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBooksRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListBooksRequest): ListBooksRequest.AsObject;
  static serializeBinaryToWriter(message: ListBooksRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBooksRequest;
  static deserializeBinaryFromReader(message: ListBooksRequest, reader: jspb.BinaryReader): ListBooksRequest;
}

export namespace ListBooksRequest {
  export type AsObject = {
    pagination?: PaginationRequest.AsObject,
  }
}

export class ListBooksResponse extends jspb.Message {
  getBooksList(): Array<Book>;
  setBooksList(value: Array<Book>): ListBooksResponse;
  clearBooksList(): ListBooksResponse;
  addBooks(value?: Book, index?: number): Book;

  getPagination(): PaginationResponse | undefined;
  setPagination(value?: PaginationResponse): ListBooksResponse;
  hasPagination(): boolean;
  clearPagination(): ListBooksResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBooksResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListBooksResponse): ListBooksResponse.AsObject;
  static serializeBinaryToWriter(message: ListBooksResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBooksResponse;
  static deserializeBinaryFromReader(message: ListBooksResponse, reader: jspb.BinaryReader): ListBooksResponse;
}

export namespace ListBooksResponse {
  export type AsObject = {
    booksList: Array<Book.AsObject>,
    pagination?: PaginationResponse.AsObject,
  }
}

export class CreateMemberRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateMemberRequest;

  getEmail(): string;
  setEmail(value: string): CreateMemberRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateMemberRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateMemberRequest): CreateMemberRequest.AsObject;
  static serializeBinaryToWriter(message: CreateMemberRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateMemberRequest;
  static deserializeBinaryFromReader(message: CreateMemberRequest, reader: jspb.BinaryReader): CreateMemberRequest;
}

export namespace CreateMemberRequest {
  export type AsObject = {
    name: string,
    email: string,
  }
}

export class CreateMemberResponse extends jspb.Message {
  getMember(): Member | undefined;
  setMember(value?: Member): CreateMemberResponse;
  hasMember(): boolean;
  clearMember(): CreateMemberResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateMemberResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateMemberResponse): CreateMemberResponse.AsObject;
  static serializeBinaryToWriter(message: CreateMemberResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateMemberResponse;
  static deserializeBinaryFromReader(message: CreateMemberResponse, reader: jspb.BinaryReader): CreateMemberResponse;
}

export namespace CreateMemberResponse {
  export type AsObject = {
    member?: Member.AsObject,
  }
}

export class UpdateMemberRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateMemberRequest;

  getName(): string;
  setName(value: string): UpdateMemberRequest;

  getEmail(): string;
  setEmail(value: string): UpdateMemberRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMemberRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMemberRequest): UpdateMemberRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateMemberRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMemberRequest;
  static deserializeBinaryFromReader(message: UpdateMemberRequest, reader: jspb.BinaryReader): UpdateMemberRequest;
}

export namespace UpdateMemberRequest {
  export type AsObject = {
    id: string,
    name: string,
    email: string,
  }
}

export class UpdateMemberResponse extends jspb.Message {
  getMember(): Member | undefined;
  setMember(value?: Member): UpdateMemberResponse;
  hasMember(): boolean;
  clearMember(): UpdateMemberResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMemberResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMemberResponse): UpdateMemberResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateMemberResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMemberResponse;
  static deserializeBinaryFromReader(message: UpdateMemberResponse, reader: jspb.BinaryReader): UpdateMemberResponse;
}

export namespace UpdateMemberResponse {
  export type AsObject = {
    member?: Member.AsObject,
  }
}

export class ListMembersRequest extends jspb.Message {
  getPagination(): PaginationRequest | undefined;
  setPagination(value?: PaginationRequest): ListMembersRequest;
  hasPagination(): boolean;
  clearPagination(): ListMembersRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMembersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMembersRequest): ListMembersRequest.AsObject;
  static serializeBinaryToWriter(message: ListMembersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMembersRequest;
  static deserializeBinaryFromReader(message: ListMembersRequest, reader: jspb.BinaryReader): ListMembersRequest;
}

export namespace ListMembersRequest {
  export type AsObject = {
    pagination?: PaginationRequest.AsObject,
  }
}

export class ListMembersResponse extends jspb.Message {
  getMembersList(): Array<Member>;
  setMembersList(value: Array<Member>): ListMembersResponse;
  clearMembersList(): ListMembersResponse;
  addMembers(value?: Member, index?: number): Member;

  getPagination(): PaginationResponse | undefined;
  setPagination(value?: PaginationResponse): ListMembersResponse;
  hasPagination(): boolean;
  clearPagination(): ListMembersResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMembersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMembersResponse): ListMembersResponse.AsObject;
  static serializeBinaryToWriter(message: ListMembersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMembersResponse;
  static deserializeBinaryFromReader(message: ListMembersResponse, reader: jspb.BinaryReader): ListMembersResponse;
}

export namespace ListMembersResponse {
  export type AsObject = {
    membersList: Array<Member.AsObject>,
    pagination?: PaginationResponse.AsObject,
  }
}

export class BorrowBookRequest extends jspb.Message {
  getCopyId(): string;
  setCopyId(value: string): BorrowBookRequest;

  getMemberId(): string;
  setMemberId(value: string): BorrowBookRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BorrowBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BorrowBookRequest): BorrowBookRequest.AsObject;
  static serializeBinaryToWriter(message: BorrowBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BorrowBookRequest;
  static deserializeBinaryFromReader(message: BorrowBookRequest, reader: jspb.BinaryReader): BorrowBookRequest;
}

export namespace BorrowBookRequest {
  export type AsObject = {
    copyId: string,
    memberId: string,
  }
}

export class BorrowBookResponse extends jspb.Message {
  getBorrow(): Borrow | undefined;
  setBorrow(value?: Borrow): BorrowBookResponse;
  hasBorrow(): boolean;
  clearBorrow(): BorrowBookResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BorrowBookResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BorrowBookResponse): BorrowBookResponse.AsObject;
  static serializeBinaryToWriter(message: BorrowBookResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BorrowBookResponse;
  static deserializeBinaryFromReader(message: BorrowBookResponse, reader: jspb.BinaryReader): BorrowBookResponse;
}

export namespace BorrowBookResponse {
  export type AsObject = {
    borrow?: Borrow.AsObject,
  }
}

export class ReturnBookRequest extends jspb.Message {
  getCopyId(): string;
  setCopyId(value: string): ReturnBookRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReturnBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReturnBookRequest): ReturnBookRequest.AsObject;
  static serializeBinaryToWriter(message: ReturnBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReturnBookRequest;
  static deserializeBinaryFromReader(message: ReturnBookRequest, reader: jspb.BinaryReader): ReturnBookRequest;
}

export namespace ReturnBookRequest {
  export type AsObject = {
    copyId: string,
  }
}

export class ReturnBookResponse extends jspb.Message {
  getBorrow(): Borrow | undefined;
  setBorrow(value?: Borrow): ReturnBookResponse;
  hasBorrow(): boolean;
  clearBorrow(): ReturnBookResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReturnBookResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReturnBookResponse): ReturnBookResponse.AsObject;
  static serializeBinaryToWriter(message: ReturnBookResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReturnBookResponse;
  static deserializeBinaryFromReader(message: ReturnBookResponse, reader: jspb.BinaryReader): ReturnBookResponse;
}

export namespace ReturnBookResponse {
  export type AsObject = {
    borrow?: Borrow.AsObject,
  }
}

export class ListBorrowingsRequest extends jspb.Message {
  getMemberId(): string;
  setMemberId(value: string): ListBorrowingsRequest;

  getPagination(): PaginationRequest | undefined;
  setPagination(value?: PaginationRequest): ListBorrowingsRequest;
  hasPagination(): boolean;
  clearPagination(): ListBorrowingsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBorrowingsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListBorrowingsRequest): ListBorrowingsRequest.AsObject;
  static serializeBinaryToWriter(message: ListBorrowingsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBorrowingsRequest;
  static deserializeBinaryFromReader(message: ListBorrowingsRequest, reader: jspb.BinaryReader): ListBorrowingsRequest;
}

export namespace ListBorrowingsRequest {
  export type AsObject = {
    memberId: string,
    pagination?: PaginationRequest.AsObject,
  }
}

export class ListBorrowingsResponse extends jspb.Message {
  getBorrowsList(): Array<Borrow>;
  setBorrowsList(value: Array<Borrow>): ListBorrowingsResponse;
  clearBorrowsList(): ListBorrowingsResponse;
  addBorrows(value?: Borrow, index?: number): Borrow;

  getPagination(): PaginationResponse | undefined;
  setPagination(value?: PaginationResponse): ListBorrowingsResponse;
  hasPagination(): boolean;
  clearPagination(): ListBorrowingsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBorrowingsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListBorrowingsResponse): ListBorrowingsResponse.AsObject;
  static serializeBinaryToWriter(message: ListBorrowingsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBorrowingsResponse;
  static deserializeBinaryFromReader(message: ListBorrowingsResponse, reader: jspb.BinaryReader): ListBorrowingsResponse;
}

export namespace ListBorrowingsResponse {
  export type AsObject = {
    borrowsList: Array<Borrow.AsObject>,
    pagination?: PaginationResponse.AsObject,
  }
}

export class AvailableCopy extends jspb.Message {
  getId(): string;
  setId(value: string): AvailableCopy;

  getBookId(): string;
  setBookId(value: string): AvailableCopy;

  getBookTitle(): string;
  setBookTitle(value: string): AvailableCopy;

  getCopyNumber(): string;
  setCopyNumber(value: string): AvailableCopy;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AvailableCopy.AsObject;
  static toObject(includeInstance: boolean, msg: AvailableCopy): AvailableCopy.AsObject;
  static serializeBinaryToWriter(message: AvailableCopy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AvailableCopy;
  static deserializeBinaryFromReader(message: AvailableCopy, reader: jspb.BinaryReader): AvailableCopy;
}

export namespace AvailableCopy {
  export type AsObject = {
    id: string,
    bookId: string,
    bookTitle: string,
    copyNumber: string,
  }
}

export class ListAvailableCopiesRequest extends jspb.Message {
  getPagination(): PaginationRequest | undefined;
  setPagination(value?: PaginationRequest): ListAvailableCopiesRequest;
  hasPagination(): boolean;
  clearPagination(): ListAvailableCopiesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAvailableCopiesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAvailableCopiesRequest): ListAvailableCopiesRequest.AsObject;
  static serializeBinaryToWriter(message: ListAvailableCopiesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAvailableCopiesRequest;
  static deserializeBinaryFromReader(message: ListAvailableCopiesRequest, reader: jspb.BinaryReader): ListAvailableCopiesRequest;
}

export namespace ListAvailableCopiesRequest {
  export type AsObject = {
    pagination?: PaginationRequest.AsObject,
  }
}

export class ListAvailableCopiesResponse extends jspb.Message {
  getCopiesList(): Array<AvailableCopy>;
  setCopiesList(value: Array<AvailableCopy>): ListAvailableCopiesResponse;
  clearCopiesList(): ListAvailableCopiesResponse;
  addCopies(value?: AvailableCopy, index?: number): AvailableCopy;

  getPagination(): PaginationResponse | undefined;
  setPagination(value?: PaginationResponse): ListAvailableCopiesResponse;
  hasPagination(): boolean;
  clearPagination(): ListAvailableCopiesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAvailableCopiesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAvailableCopiesResponse): ListAvailableCopiesResponse.AsObject;
  static serializeBinaryToWriter(message: ListAvailableCopiesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAvailableCopiesResponse;
  static deserializeBinaryFromReader(message: ListAvailableCopiesResponse, reader: jspb.BinaryReader): ListAvailableCopiesResponse;
}

export namespace ListAvailableCopiesResponse {
  export type AsObject = {
    copiesList: Array<AvailableCopy.AsObject>,
    pagination?: PaginationResponse.AsObject,
  }
}

export class CreateBookCopyRequest extends jspb.Message {
  getBookId(): string;
  setBookId(value: string): CreateBookCopyRequest;

  getCopyNumber(): string;
  setCopyNumber(value: string): CreateBookCopyRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBookCopyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBookCopyRequest): CreateBookCopyRequest.AsObject;
  static serializeBinaryToWriter(message: CreateBookCopyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBookCopyRequest;
  static deserializeBinaryFromReader(message: CreateBookCopyRequest, reader: jspb.BinaryReader): CreateBookCopyRequest;
}

export namespace CreateBookCopyRequest {
  export type AsObject = {
    bookId: string,
    copyNumber: string,
  }
}

export class CreateBookCopyResponse extends jspb.Message {
  getCopy(): BookCopy | undefined;
  setCopy(value?: BookCopy): CreateBookCopyResponse;
  hasCopy(): boolean;
  clearCopy(): CreateBookCopyResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBookCopyResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBookCopyResponse): CreateBookCopyResponse.AsObject;
  static serializeBinaryToWriter(message: CreateBookCopyResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBookCopyResponse;
  static deserializeBinaryFromReader(message: CreateBookCopyResponse, reader: jspb.BinaryReader): CreateBookCopyResponse;
}

export namespace CreateBookCopyResponse {
  export type AsObject = {
    copy?: BookCopy.AsObject,
  }
}

export class ListCopiesByBookRequest extends jspb.Message {
  getBookId(): string;
  setBookId(value: string): ListCopiesByBookRequest;

  getPagination(): PaginationRequest | undefined;
  setPagination(value?: PaginationRequest): ListCopiesByBookRequest;
  hasPagination(): boolean;
  clearPagination(): ListCopiesByBookRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCopiesByBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListCopiesByBookRequest): ListCopiesByBookRequest.AsObject;
  static serializeBinaryToWriter(message: ListCopiesByBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCopiesByBookRequest;
  static deserializeBinaryFromReader(message: ListCopiesByBookRequest, reader: jspb.BinaryReader): ListCopiesByBookRequest;
}

export namespace ListCopiesByBookRequest {
  export type AsObject = {
    bookId: string,
    pagination?: PaginationRequest.AsObject,
  }
}

export class ListCopiesByBookResponse extends jspb.Message {
  getCopiesList(): Array<BookCopy>;
  setCopiesList(value: Array<BookCopy>): ListCopiesByBookResponse;
  clearCopiesList(): ListCopiesByBookResponse;
  addCopies(value?: BookCopy, index?: number): BookCopy;

  getPagination(): PaginationResponse | undefined;
  setPagination(value?: PaginationResponse): ListCopiesByBookResponse;
  hasPagination(): boolean;
  clearPagination(): ListCopiesByBookResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCopiesByBookResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListCopiesByBookResponse): ListCopiesByBookResponse.AsObject;
  static serializeBinaryToWriter(message: ListCopiesByBookResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCopiesByBookResponse;
  static deserializeBinaryFromReader(message: ListCopiesByBookResponse, reader: jspb.BinaryReader): ListCopiesByBookResponse;
}

export namespace ListCopiesByBookResponse {
  export type AsObject = {
    copiesList: Array<BookCopy.AsObject>,
    pagination?: PaginationResponse.AsObject,
  }
}

