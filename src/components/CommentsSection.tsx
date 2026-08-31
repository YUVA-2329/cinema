'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { getComments, createComment, getCurrentProfile } from '@/lib/dataService';
import { MessageSquare, Send, Reply, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface CommentsSectionProps {
  storyId: string;
}

export default function CommentsSection({ storyId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'Top' | 'Newest'>('Top');

  const currentUser = getCurrentProfile();

  useEffect(() => {
    loadComments();
  }, [storyId, sortBy]);

  const loadComments = () => {
    let list = getComments(storyId);
    if (sortBy === 'Top') {
      list.sort((a, b) => b.likes_count - a.likes_count);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    setComments(list);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (!currentUser) {
      alert('Please sign in to leave a comment.');
      return;
    }

    createComment(storyId, newContent.trim(), null);
    setNewContent('');
    loadComments();
  };

  const handlePostReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!currentUser) {
      alert('Please sign in to reply.');
      return;
    }

    createComment(storyId, replyContent.trim(), parentId);
    setReplyContent('');
    setReplyParentId(null);
    loadComments();
  };

  return (
    <div className="my-10 p-6 sm:p-8 bg-[#121217] border border-zinc-800 rounded-3xl space-y-6">
      
      {/* Header & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-red-500" />
          <span>💬 WHAT DO YOU THINK?</span>
          <span className="text-sm font-semibold text-zinc-500">({comments.length})</span>
        </h2>

        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 font-semibold">Sort by:</span>
          <button
            onClick={() => setSortBy('Top')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              sortBy === 'Top' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('Newest')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              sortBy === 'Newest' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Write Comment Box */}
      <form onSubmit={handlePostComment} className="flex items-start gap-3">
        <img
          src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0 mt-1"
        />
        <div className="flex-grow space-y-2">
          <textarea
            rows={2}
            placeholder={currentUser ? "Add your thought... (e.g. 'Bro the climax is 🔥')" : "Sign in to leave a comment..."}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center">
            {!currentUser && (
              <Link href="/login" className="text-xs text-amber-400 font-bold hover:underline">
                Login to comment
              </Link>
            )}
            <button
              type="submit"
              disabled={!newContent.trim() || !currentUser}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all disabled:opacity-40 ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>COMMENT</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm font-sans">
            Be the first TFI fan to comment on this story!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl space-y-2">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={comment.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt={comment.author_name || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">{comment.author_name || 'Fan Reader'}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed pl-9">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 pl-9 text-xs text-zinc-400 pt-1">
                <button
                  onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 hover:text-amber-400 font-semibold transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>

              {/* Inline Reply Form */}
              {replyParentId === comment.id && (
                <div className="pl-9 mt-3 flex items-center gap-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9 space-y-2 pt-2 border-l-2 border-zinc-800 ml-9">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2.5 bg-zinc-900/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={reply.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt={reply.author_name || 'User'}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-white">{reply.author_name || 'Fan Reader'}</span>
                      </div>
                      <p className="text-xs text-zinc-300 pl-7">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
