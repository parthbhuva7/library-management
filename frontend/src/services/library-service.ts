/**
 * Centralized gRPC service layer for library operations.
 * All gRPC calls go through this service; consumers never instantiate clients.
 */

import {
  LoginRequest,
  CreateBookRequest,
  UpdateBookRequest,
  GetBookRequest,
  ListBooksRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  GetMemberRequest,
  ListMembersRequest,
  BorrowBookRequest,
  ReturnBookRequest,
  ListBorrowingsRequest,
  CreateBookCopyRequest,
  ListAvailableCopiesRequest,
  ListCopiesByBookRequest,
  PaginationRequest,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';

function make_pagination(page: number, limit: number): PaginationRequest {
  const p = new PaginationRequest();
  p.setPage(page);
  p.setLimit(limit);
  return p;
}

export const LibraryService = {
  async login(username: string, password: string) {
    const req = new LoginRequest();
    req.setUsername(username);
    req.setPassword(password);
    return get_library_client().login(req, {});
  },

  async createBook(title: string, author: string) {
    const req = new CreateBookRequest();
    req.setTitle(title);
    req.setAuthor(author);
    return get_library_client().createBook(req, get_auth_metadata());
  },

  async updateBook(id: string, title: string, author: string) {
    const req = new UpdateBookRequest();
    req.setId(id);
    req.setTitle(title);
    req.setAuthor(author);
    return get_library_client().updateBook(req, get_auth_metadata());
  },

  async getBook(id: string) {
    const req = new GetBookRequest();
    req.setId(id);
    return get_library_client().getBook(req, get_auth_metadata());
  },

  async listBooks(page = 1, limit = 20, query?: string) {
    const req = new ListBooksRequest();
    req.setPagination(make_pagination(page, limit));
    const q = typeof query === 'string' ? query.trim() : '';
    if (q) req.setQuery(q);
    return get_library_client().listBooks(req, get_auth_metadata());
  },

  async createMember(name: string, email: string) {
    const req = new CreateMemberRequest();
    req.setName(name);
    req.setEmail(email);
    return get_library_client().createMember(req, get_auth_metadata());
  },

  async updateMember(id: string, name: string, email: string) {
    const req = new UpdateMemberRequest();
    req.setId(id);
    req.setName(name);
    req.setEmail(email);
    return get_library_client().updateMember(req, get_auth_metadata());
  },

  async getMember(id: string) {
    const req = new GetMemberRequest();
    req.setId(id);
    return get_library_client().getMember(req, get_auth_metadata());
  },

  async listMembers(page = 1, limit = 20, query?: string) {
    const req = new ListMembersRequest();
    req.setPagination(make_pagination(page, limit));
    const q = typeof query === 'string' ? query.trim() : '';
    if (q) req.setQuery(q);
    return get_library_client().listMembers(req, get_auth_metadata());
  },

  async borrowBook(copyId: string, memberId: string) {
    const req = new BorrowBookRequest();
    req.setCopyId(copyId);
    req.setMemberId(memberId);
    return get_library_client().borrowBook(req, get_auth_metadata());
  },

  async returnBook(copyId: string) {
    const req = new ReturnBookRequest();
    req.setCopyId(copyId);
    return get_library_client().returnBook(req, get_auth_metadata());
  },

  async listBorrowings(page = 1, limit = 20, query?: string) {
    const req = new ListBorrowingsRequest();
    req.setPagination(make_pagination(page, limit));
    const q = typeof query === 'string' ? query.trim() : '';
    if (q) req.setQuery(q);
    return get_library_client().listBorrowings(req, get_auth_metadata());
  },

  async createBookCopy(bookId: string, copyNumber: string) {
    const req = new CreateBookCopyRequest();
    req.setBookId(bookId);
    req.setCopyNumber(copyNumber);
    return get_library_client().createBookCopy(req, get_auth_metadata());
  },

  async listAvailableCopies(page = 1, limit = 20) {
    const req = new ListAvailableCopiesRequest();
    req.setPagination(make_pagination(page, limit));
    return get_library_client().listAvailableCopies(req, get_auth_metadata());
  },

  async listCopiesByBook(bookId: string, page = 1, limit = 20) {
    const req = new ListCopiesByBookRequest();
    req.setBookId(bookId);
    req.setPagination(make_pagination(page, limit));
    return get_library_client().listCopiesByBook(req, get_auth_metadata());
  },
};
