import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useStudentProfile, useSaveStudentProfile } from '@/lib/useStudentData';
import { Card, PrimaryButton } from '@/components/journey/bits';
import { useToast } from '@/components/ui/use-toast';

const FIELD_CLS = 'w-full h-10 px-3 rounded-lg bg-white border border-[#E4E7EC] text-[13px] focus:outline-none focus:border-[#253B80]';
const LBL = 'block text-[12.5px] font-semibold text-[#344054] mb-1.5';

export default function PersonalInfoCard() {
  const { data: profile, isLoading } = useStudentProfile();
  const saveMut = useSaveStudentProfile();
  const { toast } = useToast();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        school: profile.school || '',
        grade: profile.grade || 10,
        school_year: profile.school_year || '',
        home_address: profile.home_address || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
      });
    } else if (!isLoading) {
      setForm({ full_name: '', school: '', grade: 10, school_year: '', home_address: '', phone: '', gender: '', date_of_birth: '' });
    }
  }, [profile, isLoading]);

  if (isLoading || !form) return <Card className="p-6"><LoadingLine /></Card>;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if ((form.full_name || '').trim().length < 2) {
      toast({ title: 'Thiếu họ tên', description: 'Nhập họ tên ít nhất 2 ký tự.' });
      return;
    }
    const onboarded = (form.full_name || '').trim().length >= 2 && (form.school || '').trim().length >= 2;
    try {
      await saveMut.mutateAsync({ id: profile?.id, data: { ...form, onboarded } });
      toast({ title: 'Đã lưu thông tin cá nhân' });
    } catch (e) {
      toast({ title: 'Lỗi lưu hồ sơ', description: e.message || 'Vui lòng thử lại.' });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-[14px] font-bold text-[#111827] mb-4">Thông tin cá nhân</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={LBL}>Họ và tên <span className="text-[#DC2626]">*</span></label>
          <input className={FIELD_CLS} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className={LBL}>Trường THPT <span className="text-[#DC2626]">*</span></label>
          <input className={FIELD_CLS} value={form.school} onChange={(e) => setField('school', e.target.value)} placeholder="THPT ..." />
        </div>
        <div>
          <label className={LBL}>Khối lớp</label>
          <select className={FIELD_CLS} value={form.grade} onChange={(e) => setField('grade', Number(e.target.value))}>
            {[10, 11, 12].map((g) => <option key={g} value={g}>Lớp {g}</option>)}
          </select>
        </div>
        <div>
          <label className={LBL}>Năm học</label>
          <input className={FIELD_CLS} value={form.school_year} onChange={(e) => setField('school_year', e.target.value)} placeholder="2025-2026" />
        </div>
        <div>
          <label className={LBL}>Giới tính</label>
          <select className={FIELD_CLS} value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
            <option value="">— Chọn —</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label className={LBL}>Ngày sinh</label>
          <input type="date" className={FIELD_CLS} value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
        </div>
        <div>
          <label className={LBL}>Số điện thoại</label>
          <input className={FIELD_CLS} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="09xx..." />
        </div>
        <div>
          <label className={LBL}>Khu vực sinh sống</label>
          <input className={FIELD_CLS} value={form.home_address} onChange={(e) => setField('home_address', e.target.value)} placeholder="Quận/huyện, TP" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <PrimaryButton className="!h-10 !text-[12.5px]" onClick={save} disabled={saveMut.isPending}>
          {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu thay đổi
        </PrimaryButton>
        <span className="text-[11px] text-[#98A2B3]">Hồ sơ lưu trên tài khoản của bạn — chỉ bạn可见 và chỉnh sửa.</span>
      </div>
    </Card>
  );
}

function LoadingLine() {
  return <div className="flex items-center gap-2 text-[12px] text-[#98A2B3] py-4"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải hồ sơ...</div>;
}