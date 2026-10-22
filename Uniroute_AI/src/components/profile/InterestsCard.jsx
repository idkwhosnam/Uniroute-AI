import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useStudentProfile, useSaveStudentProfile } from '@/lib/useStudentData';
import { Card, PrimaryButton } from '@/components/journey/bits';
import { useToast } from '@/components/ui/use-toast';

const INTEREST_TAGS = [
  'Công nghệ', 'Dữ liệu & phân tích', 'Kinh doanh', 'Marketing & truyền thông',
  'Logistics & chuỗi cung ứng', 'Du lịch – nhà hàng – khách sạn', 'Sáng tạo nội dung',
  'Tài chính', 'Giao tiếp & con người', 'Tiếng Anh & giao tiếp quốc tế', 'Khoa học & nghiên cứu', 'Nghệ thuật & thiết kế',
];

export default function InterestsCard() {
  const { data: profile, isLoading } = useStudentProfile();
  const saveMut = useSaveStudentProfile();
  const { toast } = useToast();
  const [interests, setInterests] = useState([]);
  const [declared, setDeclared] = useState([]);
  const [direction, setDirection] = useState('none');

  useEffect(() => {
    if (profile) {
      setInterests(profile.interests || []);
      setDeclared(profile.declared_direction ? [profile.declared_direction] : []);
      setDirection(profile.declared_direction ? 'has' : 'none');
    }
  }, [profile]);

  if (isLoading) return <Card className="p-6"><div className="flex items-center gap-2 text-[12px] text-[#98A2B3] py-4"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</div></Card>;

  const toggleInterest = (tag) => setInterests((cur) => cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]);

  const save = async () => {
    try {
      await saveMut.mutateAsync({
        id: profile?.id,
        data: {
          ...(profile || {}),
          interests,
          declared_direction: direction === 'has' ? (declared[0] || '') : '',
        },
      });
      toast({ title: 'Đã lưu sở thích & định hướng' });
    } catch (e) {
      toast({ title: 'Lỗi lưu', description: e.message });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-[14px] font-bold text-[#111827] mb-4">Sở thích & định hướng</h3>
      <p className="text-[12.5px] text-[#667085] mb-3">Chọn các sở thích bạn quan tâm (thông tin bổ trợ, không thay thế kết quả Holland):</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {INTEREST_TAGS.map((tag) => {
          const on = interests.includes(tag);
          return (
            <button key={tag} onClick={() => toggleInterest(tag)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${on ? 'bg-[#253B80] text-white border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#253B80]'}`}>
              {tag}
            </button>
          );
        })}
      </div>
      <p className="text-[12.5px] text-[#667085] mb-3">Bạn đang ở đâu trên hành trình chọn nghề?</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { mode: 'has', label: 'Đã có định hướng' },
          { mode: 'exploring', label: 'Đang tìm hiểu' },
          { mode: 'none', label: 'Chưa xác định' },
        ].map((opt) => (
          <button key={opt.mode} onClick={() => setDirection(opt.mode)}
            className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all ${direction === opt.mode ? 'bg-[#EFF4FF] text-[#253B80] border-[#253B80]' : 'bg-white text-[#344054] border-[#E4E7EC] hover:border-[#98A2B3]'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      {direction === 'has' && (
        <div>
          <p className="text-[11.5px] text-[#667085] mb-2">Định hướng bạn đang nghĩ tới:</p>
          <input
            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]"
            value={declared[0] || ''} onChange={(e) => setDeclared(e.target.value ? [e.target.value] : [])}
            placeholder="Ví dụ: Kinh doanh quốc tế, Công nghệ thông tin..."
          />
        </div>
      )}
      <div className="mt-4">
        <PrimaryButton className="!h-10 !text-[12.5px]" onClick={save} disabled={saveMut.isPending}>
          {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu sở thích
        </PrimaryButton>
      </div>
    </Card>
  );
}