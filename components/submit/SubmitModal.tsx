'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Zap, Hammer, X, Upload } from 'lucide-react';
import { pinyin } from 'pinyin-pro';

interface UserOption {
  id: number;
  name: string;
  department: string;
}

interface SubmitModalProps {
  onClose: () => void;
}

export default function SubmitModal({ onClose }: SubmitModalProps) {
  const [form, setForm] = useState({
    name: '',
    summary: '',
    track: '',
    demo_link: '',
    submitter1_name: '',
    submitter1_dept: '',
    submitter2_name: '',
    submitter2_dept: '',
    background: '',
  });
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 用户选择相关状态 - 与登录页逻辑一致
  const [users, setUsers] = useState<UserOption[]>([]);
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [selectedUser1, setSelectedUser1] = useState<UserOption | null>(null);
  const [selectedUser2, setSelectedUser2] = useState<UserOption | null>(null);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const dropdownRef1 = useRef<HTMLDivElement>(null);
  const dropdownRef2 = useRef<HTMLDivElement>(null);

  const isOptimizer = form.track === 'optimizer';

  // 加载用户列表
  useEffect(() => {
    fetch('/api/auth/users')
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setUsers(d.users || []);
        }
      })
      .catch(() => {});
  }, []);

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef1.current && !dropdownRef1.current.contains(e.target as Node) &&
          inputRef1.current && !inputRef1.current.contains(e.target as Node)) {
        setShowDropdown1(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(e.target as Node) &&
          inputRef2.current && !inputRef2.current.contains(e.target as Node)) {
        setShowDropdown2(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 筛选用户逻辑 - 与登录页一致
  const filteredUsers1 = users.filter(u => {
    if (!query1.trim()) return true;
    const q = query1.trim().toLowerCase();
    if (u.name.includes(q)) return true;
    const fullPinyin = pinyin(u.name, { toneType: 'none', type: 'array' }).join('').toLowerCase();
    const initials = pinyin(u.name, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    return fullPinyin.includes(q) || initials.includes(q);
  });

  const filteredUsers2 = users.filter(u => {
    if (!query2.trim()) return true;
    const q = query2.trim().toLowerCase();
    if (u.name.includes(q)) return true;
    const fullPinyin = pinyin(u.name, { toneType: 'none', type: 'array' }).join('').toLowerCase();
    const initials = pinyin(u.name, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    return fullPinyin.includes(q) || initials.includes(q);
  });

  function selectUser1(user: UserOption) {
    setSelectedUser1(user);
    setQuery1(user.name);
    setForm(prev => ({ 
      ...prev, 
      submitter1_name: user.name, 
      submitter1_dept: user.department 
    }));
    setShowDropdown1(false);
    setError('');
  }

  function selectUser2(user: UserOption) {
    setSelectedUser2(user);
    setQuery2(user.name);
    setForm(prev => ({ 
      ...prev, 
      submitter2_name: user.name, 
      submitter2_dept: user.department 
    }));
    setShowDropdown2(false);
    setError('');
  }

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'track' && value === 'optimizer') {
      setForm(prev => ({ 
        ...prev, 
        [field]: value, 
        submitter2_name: '', 
        submitter2_dept: '' 
      }));
      setSelectedUser2(null);
      setQuery2('');
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          setMediaFiles(prev => [...prev, data.url]);
        } else {
          setError(data.error || '上传失败');
        }
      }
    } catch {
      setError('上传失败');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.summary || !form.track || !form.submitter1_name || !form.submitter1_dept || !form.background) {
      setError('请填写所有必填项');
      return;
    }

    // 验证提交人1必须已选择（从下拉框选择，不是手动输入）
    if (!selectedUser1) {
      setError('请从下拉列表中选择第一位提交人');
      return;
    }

    // 验证提交人1的部门匹配
    if (selectedUser1.department !== form.submitter1_dept) {
      setError('第一位提交人的部门信息不匹配，请重新选择');
      return;
    }

    // Builder赛道且填写了第二位提交人时，验证第二位
    if (form.track === 'builder' && form.submitter2_name) {
      if (!selectedUser2) {
        setError('请从下拉列表中选择第二位提交人，或留空');
        return;
      }
      if (selectedUser2.department !== form.submitter2_dept) {
        setError('第二位提交人的部门信息不匹配，请重新选择');
        return;
      }
      // 不能选择自己
      if (selectedUser1.id === selectedUser2.id) {
        setError('两位提交人不能是同一个人');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, media_urls: mediaFiles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '提交失败');
        return;
      }
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-on-surface/5 backdrop-blur-md">
        <div className="bg-surface-container-lowest rounded-xl shadow-lg p-16 text-center">
          <CheckCircle size={48} className="text-secondary mx-auto mb-4" />
          <h2 className="font-headline text-3xl mb-2">Submitted!</h2>
          <p className="text-on-surface-variant">Your evolution is now in the archive.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-on-surface/5 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(46,52,45,0.06)] overflow-hidden flex flex-row max-h-[90vh]">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-surface-container-low p-10 flex-col hidden md:flex">
          <div className="mb-12">
            <span className="text-secondary text-[11px] font-bold tracking-widest uppercase mb-4 block">Submission Portal</span>
            <h2 className="font-headline text-3xl font-bold leading-tight text-on-surface mb-6">Join the Evolution.</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Stop talking about the future. Start shipping it.
            </p>
          </div>
          <div className="mt-auto space-y-6">
            <div className="flex items-start gap-3">
              <Zap size={20} className="text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-bold text-on-surface">Optimizer</p>
                <p className="text-xs text-on-surface-variant">Solo only. The efficiency warrior.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Hammer size={20} className="text-tertiary mt-0.5" />
              <div>
                <p className="text-sm font-bold text-on-surface">Builder</p>
                <p className="text-xs text-on-surface-variant">Duo or solo. The product visionary.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Submit Your Demo</h3>
              <div className="h-0.5 w-8 bg-secondary" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* 1. Who's the mastermind? */}
            <div className="space-y-6">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  1. Who's the mastermind?
                </label>
                <p className="text-sm text-on-surface-variant mb-4">项目负责人（ solo 或 duo 的名字）</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 提交人1 - 薯名下拉选择 */}
                <div className="space-y-3 relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    薯名 *
                  </label>
                  <input
                    ref={inputRef1}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-base transition-colors placeholder:text-outline-variant/50"
                    placeholder="输入薯名搜索..."
                    value={query1}
                    onChange={e => {
                      setQuery1(e.target.value);
                      setSelectedUser1(null);
                      setForm(prev => ({ ...prev, submitter1_name: '', submitter1_dept: '' }));
                      setShowDropdown1(true);
                    }}
                    onFocus={() => setShowDropdown1(true)}
                  />
                  {showDropdown1 && filteredUsers1.length > 0 && (
                    <div
                      ref={dropdownRef1}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-container-high shadow-xl max-h-48 overflow-y-auto z-50 rounded-lg"
                    >
                      {filteredUsers1.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-surface-container-low transition-colors flex justify-between items-center"
                          onClick={() => selectUser1(u)}
                        >
                          <span className="text-base font-medium text-on-surface">{u.name}</span>
                          <span className="text-xs text-outline chinese-text">{u.department}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown1 && query1 && filteredUsers1.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-container-high shadow-xl z-50 rounded-lg px-4 py-3 text-sm text-outline">
                      未找到匹配用户
                    </div>
                  )}
                </div>

                {/* 提交人1 - 部门自动填充（只读） */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    部门 *
                  </label>
                  <input
                    className="w-full bg-surface-container-low/50 border-0 border-b-2 border-outline/30 px-0 py-3 text-base text-on-surface/70 cursor-not-allowed"
                    placeholder="选择薯名后自动填充"
                    value={form.submitter1_dept}
                    readOnly
                  />
                </div>
              </div>

              {/* Member 2 for Builder */}
              <div className={`space-y-6 ${isOptimizer ? 'opacity-30 pointer-events-none' : ''}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  伙伴 {isOptimizer ? '(Optimizer 无需填写)' : '(Builder 可选)'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 提交人2 - 薯名下拉选择 */}
                  <div className="relative">
                    <input
                      ref={inputRef2}
                      className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-base transition-colors placeholder:text-outline-variant/50"
                      placeholder="输入薯名搜索..."
                      value={query2}
                      onChange={e => {
                        setQuery2(e.target.value);
                        setSelectedUser2(null);
                        setForm(prev => ({ ...prev, submitter2_name: '', submitter2_dept: '' }));
                        setShowDropdown2(true);
                      }}
                      onFocus={() => !isOptimizer && setShowDropdown2(true)}
                      disabled={isOptimizer}
                    />
                    {showDropdown2 && filteredUsers2.length > 0 && (
                      <div
                        ref={dropdownRef2}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-container-high shadow-xl max-h-48 overflow-y-auto z-50 rounded-lg"
                      >
                        {filteredUsers2.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-surface-container-low transition-colors flex justify-between items-center"
                            onClick={() => selectUser2(u)}
                          >
                            <span className="text-base font-medium text-on-surface">{u.name}</span>
                            <span className="text-xs text-outline chinese-text">{u.department}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 提交人2 - 部门自动填充（只读） */}
                  <input
                    className="w-full bg-surface-container-low/50 border-0 border-b-2 border-outline/30 px-0 py-3 text-base text-on-surface/70 cursor-not-allowed"
                    placeholder="选择薯名后自动填充"
                    value={form.submitter2_dept}
                    readOnly
                    disabled={isOptimizer}
                  />
                </div>
              </div>
            </div>

            {/* 2. Give it a Codename */}
            <div className="space-y-4">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  2. Give it a Codename
                </label>
                <p className="text-sm text-on-surface-variant">取个响亮的名字（要够 punchy）</p>
              </div>
              <input
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-xl font-headline font-bold transition-colors placeholder:text-outline-variant/50"
                placeholder="Project Name / 项目名称 *"
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
              />
            </div>

            {/* 3. Choose Your Fighter */}
            <div className="space-y-4">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  3. Choose Your Fighter
                </label>
                <p className="text-sm text-on-surface-variant">选择你的赛道</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex items-start gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  form.track === 'optimizer' 
                    ? 'border-secondary bg-secondary-container/30' 
                    : 'border-outline-variant/30 hover:border-outline'
                }`}>
                  <input
                    type="radio"
                    name="track"
                    value="optimizer"
                    checked={form.track === 'optimizer'}
                    onChange={e => updateField('track', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⚡️</span>
                      <span className="font-bold text-on-surface">Optimizer</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">The Solo Efficiency Warrior / 效率战士（单人）</p>
                  </div>
                </label>
                <label className={`relative flex items-start gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  form.track === 'builder' 
                    ? 'border-tertiary bg-tertiary-container/30' 
                    : 'border-outline-variant/30 hover:border-outline'
                }`}>
                  <input
                    type="radio"
                    name="track"
                    value="builder"
                    checked={form.track === 'builder'}
                    onChange={e => updateField('track', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🛠️</span>
                      <span className="font-bold text-on-surface">Builder</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">The Product Visionary / 产品 visionary（可组队）</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. The "Why" */}
            <div className="space-y-4">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  4. The "Why"
                </label>
                <p className="text-sm text-on-surface-variant">解决什么问题？背后的故事是什么？</p>
              </div>
              <textarea
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-base transition-colors resize-none"
                placeholder="Why did you make it? What problem are you killing? / 为什么要做这个？解决什么痛点？ *"
                rows={5}
                value={form.background}
                onChange={e => updateField('background', e.target.value)}
              />
            </div>

            {/* 5. The One-Line Pitch */}
            <div className="space-y-4">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  5. The One-Line Pitch
                </label>
                <p className="text-sm text-on-surface-variant">电梯演讲，一句话打动 VC</p>
              </div>
              <input
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-base transition-colors placeholder:text-outline-variant/50"
                placeholder="One sentence only. No jargon, just impact. / 一句话概括，不要术语，只要冲击力 *"
                value={form.summary}
                onChange={e => updateField('summary', e.target.value)}
              />
            </div>

            {/* 6. Show Us the Goods */}
            <div className="space-y-4">
              <div>
                <label className="block font-headline text-lg font-bold text-on-surface mb-2">
                  6. Show Us the Goods
                </label>
                <p className="text-sm text-on-surface-variant">展示你的作品（Demo、文档、GitHub）</p>
              </div>
              <input
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-0 py-3 text-base transition-colors placeholder:text-outline-variant/50"
                placeholder="Link to demo / doc / GitHub / 演示链接"
                type="url"
                value={form.demo_link}
                onChange={e => updateField('demo_link', e.target.value)}
              />
            </div>

            {/* Media Upload */}
            <div className="pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                Media / 媒体附件（可选）
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={e => handleFileUpload(e.target.files)}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
                className="w-full aspect-[21/6] rounded-lg bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-6 group hover:border-primary/50 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <p className="text-sm text-on-surface-variant">上传中...</p>
                ) : mediaFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <CheckCircle size={16} className="text-primary" />
                    <span className="text-sm text-on-surface-variant">已上传 {mediaFiles.length} 个文件</span>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-outline-variant group-hover:text-primary mb-3" />
                    <p className="text-sm font-medium text-on-surface-variant">拖拽或点击上传图片/视频</p>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-error text-sm">{error}</p>}

            {/* Submit Footer */}
            <div className="flex items-center justify-end pt-10 border-t border-outline-variant/10 mt-12">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-surface-container-high transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-3 text-xs font-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary-dim transition-all shadow-lg hover:shadow-xl rounded disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
