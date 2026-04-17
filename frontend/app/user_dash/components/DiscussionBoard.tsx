'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Loader2, Sparkles, MessageCircle, Heart, Trash2, Reply, X } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface Engagement {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  likes: string[];
  replies: Engagement[];
}

interface DiscussionBoardProps {
  resourceId: string;
  currentUserId?: string;
}

export default function DiscussionBoard({ resourceId, currentUserId }: DiscussionBoardProps) {
  const [discussions, setDiscussions] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscussions();
  }, [resourceId]);

  const fetchDiscussions = async () => {
    try {
      const res = await apiUser.get(`/api/finance-content/${resourceId}/engagement`);
      setDiscussions(res.data);
    } catch (err) {
      console.error('Fetch discussion error');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      await apiUser.post(`/api/finance-content/${resourceId}/engagement`, {
        text: newComment,
        parentId: replyTo?.id || null
      });
      setNewComment('');
      setReplyTo(null);
      fetchDiscussions();
    } catch (err) {
      alert('You must be logged in to participate in discussions.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    setLikingId(commentId);
    try {
      await apiUser.post(`/api/finance-content/engagement/${commentId}/like`);
      fetchDiscussions();
    } catch (err) {
      console.error('Like error');
    } finally {
      setLikingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeletingId(commentId);
    try {
      await apiUser.delete(`/api/finance-content/engagement/${commentId}`);
      fetchDiscussions();
    } catch (err) {
      alert('Could not delete. You can only delete your own comments.');
    } finally {
      setDeletingId(null);
    }
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Engagement; isReply?: boolean }) => {
    const isOwner = currentUserId && comment.userId === currentUserId;
    const isLiked = currentUserId && comment.likes?.includes(currentUserId);
    const likeCount = comment.likes?.length || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-6 first:mt-0'}`}
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-gray-100 flex items-center justify-center text-gray-300 overflow-hidden">
            {comment.userAvatar
              ? <img src={comment.userAvatar} className="w-full h-full object-cover" alt={comment.userName} />
              : <span className="text-[11px] font-bold text-gray-400">{comment.userName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}</span>
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] font-bold text-gray-800">{comment.userName}</span>
            <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">
              {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
            {isReply && (
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">↩ reply</span>
            )}
          </div>

          <div className="bg-slate-50/80 border border-transparent group-hover:bg-white group-hover:border-gray-100/60 px-4 py-3 rounded-2xl rounded-tl-sm transition-all">
            <p className="text-[13px] font-medium text-gray-700 leading-relaxed">{comment.text}</p>
          </div>

          <div className="flex items-center gap-4 pl-1 mt-2">
            {!isReply && (
              <button
                onClick={() => setReplyTo({ id: comment._id, name: comment.userName })}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-[#253A7B] transition-colors"
              >
                <Reply className="w-2.5 h-2.5" />
                Reply
              </button>
            )}

            <button
              onClick={() => handleLike(comment._id)}
              disabled={likingId === comment._id}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-300 hover:text-red-400'
              }`}
            >
              {likingId === comment._id
                ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                : <Heart className={`w-2.5 h-2.5 ${isLiked ? 'fill-red-400' : ''}`} />
              }
              {likeCount > 0 ? likeCount : 'Like'}
            </button>

            {isOwner && (
              <button
                onClick={() => handleDelete(comment._id)}
                disabled={deletingId === comment._id}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-200 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                {deletingId === comment._id
                  ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  : <Trash2 className="w-2.5 h-2.5" />
                }
                Delete
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-10 border-t border-gray-50 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#253A7B]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-800 tracking-tight">
            Public Discussion
            {discussions.length > 0 && (
              <span className="ml-2 text-[10px] font-bold text-gray-300">({discussions.length})</span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-gray-50">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Thread</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-10 space-y-3 pb-10 border-b border-gray-50">
        <div className="relative bg-white border border-gray-100 rounded-[24px] p-2 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-blue-50 rounded-xl mb-2 flex justify-between items-center border border-blue-100/50"
              >
                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5">
                  <Reply className="w-3 h-3" />
                  Replying to <span className="underline">{replyTo.name}</span>
                </span>
                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-blue-100 rounded-lg transition-all text-blue-400">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
            placeholder="Share a thought, ask a query, or join the discussion..."
            rows={2}
            className="w-full px-4 py-3 border-none outline-none text-[13px] font-medium text-gray-800 placeholder:text-gray-200 bg-transparent resize-none"
          />
          <div className="flex justify-between items-center p-1 pt-0 px-2">
            <span className="text-[10px] font-medium text-gray-200">Ctrl + Enter to submit</span>
            <button
              onClick={handlePost}
              disabled={!newComment.trim() || isPosting}
              className="px-6 py-2 bg-[#253A7B] text-white rounded-xl text-[11px] font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-30"
            >
              {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
              POST
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] font-medium text-gray-300">
          Keep discussions professional and educational. Visible to all members.
        </p>
      </div>

      {/* Discussion Feed */}
      <div className="space-y-0 pb-20">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-100" />
            <span className="text-[10px] font-bold text-gray-200 tracking-widest uppercase">Loading conversation...</span>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-[32px] border border-dashed border-gray-100">
            <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">No discussion yet. Start the conversation!</p>
          </div>
        ) : (
          discussions.map((comment) => (
            <React.Fragment key={comment._id}>
              <CommentCard comment={comment} />
              {comment.replies?.map(reply => (
                <CommentCard key={reply._id} comment={reply} isReply />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
