import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AvatarBadge from '../components/AvatarBadge';
import {
  createEventsSource,
  getMatches,
  getMessages,
  getPrivatePhotos,
  grantPhotoAccess,
  parseMatchEvent,
  parseMessageEvent,
  parseTypingEvent,
  sendMessage,
  sendTyping
} from '../services/api';
import { ChatMessage, MatchSummary } from '../types';

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const params: any = useParams();
  const matchUserId = params.matchUserId || '';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [targetMatch, setTargetMatch] = useState<MatchSummary | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [privatePhotos, setPrivatePhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');

  const loadChat = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const [allMatches, chatMessages] = await Promise.all([getMatches(), getMessages(matchUserId)]);
      const matchedUser = allMatches.find(match => match.user.id === matchUserId) || null;
      if (!matchedUser) {
        setError('Match not found.');
      }
      setTargetMatch(matchedUser);
      setMessages(chatMessages);

      if (matchedUser?.canViewPrivatePhotos) {
        try {
          const photos = await getPrivatePhotos(matchUserId);
          setPrivatePhotos(photos);
          setPhotoError('');
        } catch (err) {
          setPhotoError(err instanceof Error ? err.message : 'Could not load private photos');
        }
      } else {
        setPrivatePhotos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadChat();
  }, [matchUserId]);

  useEffect(() => {
    const source = createEventsSource();

    source.addEventListener('message', (event: MessageEvent) => {
      const message = parseMessageEvent(event.data);
      const belongsToThread =
        (message.fromUserId === userId && message.toUserId === matchUserId) ||
        (message.fromUserId === matchUserId && message.toUserId === userId);

      if (belongsToThread) {
        setMessages(prev => {
          if (prev.some(existing => existing.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    });

    source.addEventListener('typing', (event: MessageEvent) => {
      const typing = parseTypingEvent(event.data);
      if (typing.fromUserId === matchUserId) {
        setIsTyping(Boolean(typing.isTyping));
      }
    });

    source.addEventListener('match', (event: MessageEvent) => {
      const match = parseMatchEvent(event.data);
      if (match?.user?.id === matchUserId) {
        setTargetMatch(match);
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [matchUserId, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void sendTyping(matchUserId, draft.trim().length > 0);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [draft, matchUserId]);

  const send = async (): Promise<void> => {
    if (!draft.trim()) {
      return;
    }

    try {
      await sendMessage(matchUserId, draft);
      setDraft('');
      void sendTyping(matchUserId, false);
      void loadChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const grantAccess = async (): Promise<void> => {
    try {
      await grantPhotoAccess(matchUserId);
      await loadChat();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Unable to grant photo access');
    }
  };

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages]
  );

  return (
    <div className="page-shell chat-shell">
      <div className="page-head">
        <h1>{targetMatch ? `Chat with ${targetMatch.user.name}` : 'Chat'}</h1>
        <Link className="btn btn-ghost" to="/matches">
          Back
        </Link>
      </div>

      {targetMatch && (
        <div className="trust-panel">
          <AvatarBadge avatarKey={targetMatch.user.avatarKey} name={targetMatch.user.name} size={64} />
          <div>
            <p className="muted">Trust progress: {targetMatch.messageCount}/8 messages</p>
            {!targetMatch.canViewPrivatePhotos && (
              <p className="muted">Private photos unlock only after enough chat and explicit permission.</p>
            )}
            {targetMatch.isEligibleToGrantPhotoAccess && !targetMatch.hasGrantedPhotoAccess && (
              <button className="btn btn-ghost" onClick={() => void grantAccess()}>
                Grant Your Photo Access
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <p>Loading conversation...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="chat-thread">
        {sortedMessages.map(message => (
          <div
            key={message.id}
            className={`message-bubble ${message.fromUserId === userId ? 'mine' : 'theirs'}`}
          >
            <p>{message.text}</p>
            <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      {isTyping && <p className="typing-indicator">{targetMatch?.user.name || 'They'} is typing...</p>}

      {targetMatch?.canViewPrivatePhotos && (
        <div className="private-photo-grid">
          {privatePhotos.map(photo => (
            <img key={photo} src={photo} alt="Private profile" className="private-photo" />
          ))}
        </div>
      )}
      {photoError && <p className="error-text">{photoError}</p>}

      <div className="chat-input-row">
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Write your message..."
          onKeyDown={event => {
            if (event.key === 'Enter') {
              void send();
            }
          }}
        />
        <button className="btn btn-like" onClick={() => void send()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
