import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ============ Dữ liệu tham chiếu (dùng chung, cache dài) ============

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { items } = await base44.entities.Subject.filter({ is_active: true }, { sort: 'label', limit: 50 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useHollandQuestions() {
  return useQuery({
    queryKey: ['hollandQuestions'],
    queryFn: async () => {
      const { items } = await base44.entities.HollandQuestion.filter({ is_active: true }, { sort: 'order', limit: 100 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useMajorGroups() {
  return useQuery({
    queryKey: ['majorGroups'],
    queryFn: async () => {
      const { items } = await base44.entities.MajorGroup.filter({ is_active: true }, { limit: 50 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useMajors() {
  return useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { items } = await base44.entities.Major.filter({ is_active: true }, { limit: 100 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUniversities() {
  return useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { items } = await base44.entities.University.filter({}, { limit: 50 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============ Hồ sơ học sinh (theo user, RLS) ============

export function useStudentProfile() {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const { items } = await base44.entities.StudentProfile.filter({}, { sort: '-created_date', limit: 1 });
      return items[0] || null;
    },
  });
}

export function useSaveStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.StudentProfile.update(id, data);
      return base44.entities.StudentProfile.create(data);
    },
    onSuccess: (record) => {
      queryClient.setQueryData(['studentProfile'], record);
    },
  });
}

// ============ Kết quả học tập ============

export function useAcademicRecords() {
  return useQuery({
    queryKey: ['academicRecords'],
    queryFn: async () => {
      const { items } = await base44.entities.AcademicRecord.filter({}, { sort: '-created_date', limit: 50 });
      return items;
    },
  });
}

export function useSaveAcademicRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.AcademicRecord.update(id, data);
      return base44.entities.AcademicRecord.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academicRecords'] }),
  });
}

export function useDeleteAcademicRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => base44.entities.AcademicRecord.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academicRecords'] }),
  });
}

// ============ Holland: câu trả lời & kết quả ============

export function useHollandResults() {
  return useQuery({
    queryKey: ['hollandResults'],
    queryFn: async () => {
      const { items } = await base44.entities.HollandResult.filter({}, { sort: '-created_date', limit: 10 });
      return items;
    },
  });
}

export function useLatestHollandResult() {
  const q = useHollandResults();
  return { ...q, data: q.data?.[0] || null };
}

export function useSaveHollandResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => base44.entities.HollandResult.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hollandResults'] }),
  });
}

export function useUpdateHollandResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => base44.entities.HollandResult.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hollandResults'] }),
  });
}

export function useHollandAnswers(sessionId) {
  return useQuery({
    queryKey: ['hollandAnswers', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { items } = await base44.entities.HollandAnswer.filter({ session_id: sessionId }, { limit: 100 });
      return items;
    },
    enabled: !!sessionId,
  });
}

export function useSaveHollandAnswers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (answers) => base44.entities.HollandAnswer.bulkCreate(answers),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hollandAnswers'] }),
  });
}

// ============ SubjectRule (quy chế môn học) ============

export function useSubjectRules() {
  return useQuery({
    queryKey: ['subjectRules'],
    queryFn: async () => {
      const { items } = await base44.entities.SubjectRule.filter({}, { sort: '-year', limit: 20 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubjectRuleForYear(year) {
  const q = useSubjectRules();
  const rules = q.data || [];
  const rule = rules.find((r) => r.year === year) || rules[0] || null;
  return { ...q, data: rule };
}

// ============ SubjectSelection (lựa chọn môn của học sinh) ============

export function useSubjectSelection() {
  return useQuery({
    queryKey: ['subjectSelection'],
    queryFn: async () => {
      const { items } = await base44.entities.SubjectSelection.filter({}, { sort: '-created_date', limit: 10 });
      return items[0] || null;
    },
  });
}

export function useSaveSubjectSelection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.SubjectSelection.update(id, data);
      return base44.entities.SubjectSelection.create(data);
    },
    onSuccess: (record) => {
      queryClient.setQueryData(['subjectSelection'], record);
    },
  });
}

// ============ AdmissionProgram (chương trình tuyển sinh) ============

export function useAdmissionPrograms() {
  return useQuery({
    queryKey: ['admissionPrograms'],
    queryFn: async () => {
      const { items } = await base44.entities.AdmissionProgram.filter({}, { sort: '-year', limit: 1000 });
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============ AdmissionTarget (mục tiêu xét tuyển) ============

export function useAdmissionTargets() {
  return useQuery({
    queryKey: ['admissionTargets'],
    queryFn: async () => {
      const { items } = await base44.entities.AdmissionTarget.filter({}, { sort: '-created_date', limit: 20 });
      return items;
    },
  });
}

export function useSaveAdmissionTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => base44.entities.AdmissionTarget.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionTargets'] }),
  });
}

export function useUpdateAdmissionTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => base44.entities.AdmissionTarget.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionTargets'] }),
  });
}

export function useDeleteAdmissionTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => base44.entities.AdmissionTarget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionTargets'] });
      queryClient.invalidateQueries({ queryKey: ['studyTasks'] });
    },
  });
}

// ============ AdmissionInterest (phương án xét tuyển học sinh quan tâm) ============

export function useAdmissionInterests() {
  return useQuery({
    queryKey: ['admissionInterests'],
    queryFn: async () => {
      const { items } = await base44.entities.AdmissionInterest.filter({}, { sort: '-created_date', limit: 50 });
      return items;
    },
  });
}

export function useSaveAdmissionInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => base44.entities.AdmissionInterest.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionInterests'] }),
  });
}

export function useSaveAdmissionInterests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (records) => base44.entities.AdmissionInterest.bulkCreate(records),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionInterests'] }),
  });
}

export function useDeleteAdmissionInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => base44.entities.AdmissionInterest.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionInterests'] }),
  });
}

// ============ StudyPlan (kế hoạch ôn tập) ============

export function useStudyPlans() {
  return useQuery({
    queryKey: ['studyPlans'],
    queryFn: async () => {
      const { items } = await base44.entities.StudyPlan.filter({ is_active: true }, { sort: '-created_date', limit: 20 });
      return items;
    },
  });
}

export function useActiveStudyPlan() {
  const q = useStudyPlans();
  return { ...q, data: q.data?.[0] || null };
}

export function useSaveStudyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.StudyPlan.update(id, data);
      return base44.entities.StudyPlan.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlans'] }),
  });
}

export function useDeleteStudyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => base44.entities.StudyPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlans'] }),
  });
}

// ============ StudyTask (môn cần ôn) ============

export function useStudyTasks() {
  return useQuery({
    queryKey: ['studyTasks'],
    queryFn: async () => {
      const { items } = await base44.entities.StudyTask.filter({ archived: { $ne: true } }, { sort: 'week_number', limit: 200 });
      return items;
    },
  });
}

export function useAllStudyTasks() {
  return useQuery({
    queryKey: ['allStudyTasks'],
    queryFn: async () => {
      const { items } = await base44.entities.StudyTask.filter({}, { sort: '-created_date', limit: 500 });
      return items;
    },
  });
}

export function useSaveStudyTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks) => base44.entities.StudyTask.bulkCreate(tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allStudyTasks'] });
    },
  });
}

export function useUpdateStudyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => base44.entities.StudyTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allStudyTasks'] });
    },
  });
}

export function useDeleteStudyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => base44.entities.StudyTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allStudyTasks'] });
    },
  });
}

export function useArchiveStudyTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskIds) => {
      return base44.entities.StudyTask.bulkUpdate(
        taskIds.map((id) => ({ id, archived: true, status: 'archived' }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allStudyTasks'] });
    },
  });
}

// ============ Đặt lại toàn bộ dữ liệu học sinh ============

export function useResetStudentData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // RLS giới hạn mỗi truy vấn chỉ xoá bản ghi do chính người dùng tạo.
      await Promise.all([
        base44.entities.HollandAnswer.deleteMany({}),
        base44.entities.HollandResult.deleteMany({}),
        base44.entities.AcademicRecord.deleteMany({}),
        base44.entities.SubjectSelection.deleteMany({}),
        base44.entities.AdmissionTarget.deleteMany({}),
        base44.entities.AdmissionInterest.deleteMany({}),
        base44.entities.StudyTask.deleteMany({}),
        base44.entities.StudyPlan.deleteMany({}),
        base44.entities.StudentProfile.deleteMany({}),
      ]);
    },
    onSuccess: () => queryClient.clear(),
  });
}