'use client';

import React, { useState, useEffect } from 'react';
import { getCampaigns, getContentCalendar, addContentItem } from '@/data/storage';
import { MarketingCampaign, ContentItem, ContentPlatform, ContentStatus } from '@/types';
import {
  Megaphone,
  Calendar,
  Plus,
  Share2,
  Video,
  Globe,
  Clock,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  
  // Add Content Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    platform: 'facebook' as ContentPlatform,
    status: 'draft' as ContentStatus,
    author: 'Phạm Minh Phương',
    scheduledAt: '2026-10-20',
    contentSnippet: ''
  });

  const loadData = () => {
    setCampaigns(getCampaigns());
    setContentList(getContentCalendar());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title.trim()) return;

    addContentItem({
      title: newContent.title.trim(),
      platform: newContent.platform,
      status: newContent.status,
      author: newContent.author,
      scheduledAt: newContent.scheduledAt,
      contentSnippet: newContent.contentSnippet
    });

    setModalOpen(false);
    setNewContent({
      title: '',
      platform: 'facebook',
      status: 'draft',
      author: 'Phạm Minh Phương',
      scheduledAt: '2026-10-20',
      contentSnippet: ''
    });
    loadData();
  };

  const getPlatformBadge = (platform: ContentPlatform) => {
    switch (platform) {
      case 'facebook':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">Facebook</span>;
      case 'tiktok':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">TikTok</span>;
      case 'website':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Website</span>;
      case 'press':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Báo chí / PR</span>;
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'idea':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">Ý tưởng</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Bản nháp</span>;
      case 'pending_review':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">Chờ duyệt</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">Đã duyệt</span>;
      case 'published':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Đã đăng</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Marketing & Lịch Nội Dung (Content Calendar)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch truyền thông tuyển sinh trên Facebook, TikTok, Website và Báo chí
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lên Lịch Bài Viết Mới</span>
        </button>
      </div>

      {/* Campaigns Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Chiến Dịch Truyền Thông Đang Triển Khai ({campaigns.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaigns.map(camp => (
            <div
              key={camp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    Kênh: {camp.channel}
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {camp.status === 'active' ? 'Đang hoạt động' : 'Hoàn tất'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {camp.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  <strong>Đối tượng:</strong> {camp.targetAudience}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngân sách / Đã chi:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(camp.spent / 1000000).toFixed(1)}Tr / {(camp.budget / 1000000).toFixed(1)}Tr
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số Lead thu về:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {camp.leadsGenerated} leads
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Lịch Đăng Bài & Nội Dung Truyền Thông (Content Calendar)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý quy trình phê duyệt nội dung từ ý tưởng đến bài đăng chính thức
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {contentList.length} bài viết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Tiêu đề bài viết</th>
                <th className="px-4 py-3.5">Nền tảng</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Tác giả</th>
                <th className="px-4 py-3.5">Ngày đăng dự kiến</th>
                <th className="px-6 py-3.5 text-right">Liên kết bài</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contentList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5">
                    <span className="font-bold text-slate-900 block text-xs">
                      {item.title}
                    </span>
                    {item.contentSnippet && (
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.contentSnippet}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {getPlatformBadge(item.platform)}
                  </td>
                  <td className="px-4 py-3.5">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {item.author}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    {item.scheduledAt}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {item.publishUrl ? (
                      <a
                        href={item.publishUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                      >
                        <span>Xem link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Chưa công bố</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Content Item */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Lên Lịch Bài Viết Tuyển Sinh Mới
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơ hội nhận học bổng toàn phần CMU với 25 điểm THPT..."
                  value={newContent.title}
                  onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nền tảng đăng</label>
                  <select
                    value={newContent.platform}
                    onChange={e => setNewContent({ ...newContent, platform: e.target.value as ContentPlatform })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="facebook">Facebook Fanpage</option>
                    <option value="tiktok">Kênh TikTok VN-US</option>
                    <option value="website">Website Tin Tức</option>
                    <option value="press">Báo chí / Báo Dân trí, Tuổi trẻ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={newContent.status}
                    onChange={e => setNewContent({ ...newContent, status: e.target.value as ContentStatus })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="idea">Ý tưởng</option>
                    <option value="draft">Bản nháp</option>
                    <option value="pending_review">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách (Tác giả)</label>
                  <input
                    type="text"
                    value={newContent.author}
                    onChange={e => setNewContent({ ...newContent, author: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày đăng dự kiến</label>
                  <input
                    type="date"
                    value={newContent.scheduledAt}
                    onChange={e => setNewContent({ ...newContent, scheduledAt: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tóm tắt nội dung bài đăng</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú dàn ý hoặc kịch bản video..."
                  value={newContent.contentSnippet}
                  onChange={e => setNewContent({ ...newContent, contentSnippet: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Lưu Vào Lịch Đăng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
