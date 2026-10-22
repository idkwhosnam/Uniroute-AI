import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrialScoreDialog({ open, onOpenChange, title, description, value, onSave }) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    if (open) setVal(value);
  }, [open, value]);

  const handleSave = () => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    onSave(Math.max(0, Math.min(100, num)));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-11 text-[16px] font-semibold"
            placeholder="Nhập điểm..."
            autoFocus
          />
          <p className="text-[12px] text-[#94A3B8] mt-2">
            Điểm sẽ được dùng để tính lại chỉ số khả thi & mô phỏng trúng tuyển.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#1E3A8A] hover:bg-[#1E293B]"
            onClick={handleSave}
            disabled={val === "" || isNaN(parseFloat(val))}
          >
            Lưu điểm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}