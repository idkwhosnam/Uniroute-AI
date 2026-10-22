import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Shield } from "lucide-react";

export default function WishList({ wishes, onReorder, onToggleBackup, onRemove }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-medium text-[#0F172A]">Danh sách nguyện vọng</h2>
        <span className="text-[11.5px] text-[#94A3B8]">Kéo để sắp xếp thứ tự ưu tiên</span>
      </div>

      {wishes.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-[13px] font-semibold text-[#0F172A]">Chưa có nguyện vọng nào</div>
          <div className="text-[12px] text-[#94A3B8] mt-1">Dùng khung tìm kiếm bên trái để thêm nguyện vọng đầu tiên.</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="wishes">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="mt-3 space-y-2.5">
                {wishes.map((w, index) => (
                  <Draggable key={w.id} draggableId={w.id} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`flex items-center gap-3 p-3.5 rounded-lg border transition-colors ${
                          w.primary
                            ? "border-[#E2E8F0] bg-[#F8FAFC]"
                            : "border-dashed border-[#FDE68A] bg-[#FFFBEB]"
                        }`}
                      >
                        <button
                          {...drag.dragHandleProps}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] cursor-grab active:cursor-grabbing shrink-0"
                          title="Kéo để sắp xếp"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>

                        <span
                          className={`w-10 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            w.primary ? "bg-[#1E3A8A] text-white" : "bg-[#F59E0B] text-white"
                          }`}
                        >
                          NV{index + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-semibold text-[#0F172A] truncate">{w.school}</div>
                          <div className="text-[11.5px] text-[#475569] truncate">
                            {w.major} · <span className="text-[#6366F1] font-medium">{w.method}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleBackup(w.id)}
                          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11.5px] font-semibold shrink-0 transition-colors ${
                            w.primary
                              ? "bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] hover:bg-[#DBEAFE]"
                              : "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                          }`}
                          title={w.primary ? "Đánh dấu là nguyện vọng dự phòng" : "Chuyển về nguyện vọng chính"}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {w.primary ? "Chính" : "Dự phòng"}
                        </button>

                        <button
                          onClick={() => onRemove(w.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shrink-0"
                          title="Xóa nguyện vọng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}