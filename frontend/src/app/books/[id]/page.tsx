'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error, is_not_found_error } from '@/lib/grpc-error-handler';
import BackLink from '@/components/BackLink';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import CopiesModal from '@/components/CopiesModal';
import styles from '@/styles/Page.module.css';

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [copyCount, setCopyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [showCopiesModal, setShowCopiesModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    setNotFound(false);
    LibraryService.getBook(id)
      .then((resp) => {
        const book = resp.getBook();
        if (book) {
          setTitle(book.getTitle());
          setAuthor(book.getAuthor());
          setCopyCount(book.getCopyCount());
        }
      })
      .catch((err) => {
        if (is_auth_error(err)) {
          window.location.href = '/login';
          return;
        }
        if (is_not_found_error(err)) {
          setNotFound(true);
          setError(handle_grpc_error(err));
        } else {
          setError(handle_grpc_error(err));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  if (notFound || error) {
    return (
      <div>
        <BackLink href="/books" />
        <ErrorMessage message={error || 'Book not found'} />
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/books" />
      <PageTitle>{title}</PageTitle>
      <div className={styles.paragraph}>
        <strong>Author:</strong> {author}
      </div>
      <div className={styles.paragraph}>
        <strong>Copies:</strong> {copyCount}
      </div>
      <div className={styles.actions}>
        <PageLink href={`/books/${id}/edit`}>Edit</PageLink>
        {' | '}
        <Button onClick={() => setShowCopiesModal(true)}>View Copies</Button>
      </div>
      {showCopiesModal && (
        <CopiesModal
          bookId={id}
          bookTitle={title}
          onClose={() => setShowCopiesModal(false)}
        />
      )}
    </div>
  );
}
