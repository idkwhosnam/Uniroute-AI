import React from 'react';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LookupFilters({
  title, subtitle, search, onSearch, university, onUniversity, major, onMajor, uniList, majorList,
}) {
  return (
    <div className="rounded-xl border border-[#FDE68A] bg-[#FFF7E6] p-4 mb-4">
      <h2 className="text-[15px] font-bold text-[#111827]">{title}</h2>
      <p className="text-[12px] text-[#667085] mt-0.5">{subtitle}</p>

      <div className="mt-3">
        <label className="block text-[12.5px] font-semibold text-[#344054] mb-1.5">Nhập tên/mã ngành bạn muốn tìm kiếm:</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
          <input
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-[#E4E7EC] text-[12.5px] focus:outline-none focus:border-[#253B80]"
            placeholder="Tên trường, mã trường hoặc tên/mã ngành"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
        <Select value={university} onValueChange={onUniversity}>
          <SelectTrigger className="h-9 text-[12.5px] bg-white"><SelectValue placeholder="Trường" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trường</SelectItem>
            {uniList.map((u) => <SelectItem key={u.code} value={u.code}>{u.short_name || u.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={major} onValueChange={onMajor}>
          <SelectTrigger className="h-9 text-[12.5px] bg-white"><SelectValue placeholder="Ngành" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ngành</SelectItem>
            {majorList.map((m) => <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}