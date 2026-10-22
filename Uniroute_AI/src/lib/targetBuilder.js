// targetBuilder.js — Chuyển dữ liệu tuyển sinh thành bản ghi quan tâm / mục tiêu xét tuyển.
import { METHOD_LABELS } from '@/lib/admissionEngine';

// Khóa định danh một phương thức xét tuyển đã quan tâm (ngành + trường + phương thức + năm)
export const planKey = (plan) =>
  `${plan.university_code}|${plan.major_code}|${plan.method}|${plan.year || ''}`;

// Khóa định danh một cặp ngành – trường quan tâm (không kèm phương thức xét tuyển)
export const pairKey = (plan) => `${plan.university_code}|${plan.major_code}`;

export function interestPayloadFromProgram(program, origin = 'advice') {
  return {
    university_code: program.university_code,
    university_name: program.university_name,
    major_code: program.major_code,
    major_name: program.major_name,
    year: program.year,
    method: program.method,
    method_label: program.method_label || METHOD_LABELS[program.method] || program.method,
    combination: program.combination,
    combination_subjects: program.combination_subjects || [],
    benchmark_score: program.benchmark_score,
    benchmark_scale: program.benchmark_scale,
    benchmark_year: program.benchmark_year,
    tuition: program.tuition,
    quota: program.quota,
    conditions: program.conditions,
    source_name: program.source_name,
    source_url: program.source_url,
    data_status: program.data_status,
    origin,
  };
}

// Quan tâm ngành – trường (chưa chọn phương thức xét tuyển)
export function pairInterestPayload({ university_code, university_name, major_code, major_name, latestProgram, year }, origin = 'lookup') {
  return {
    university_code,
    university_name,
    major_code,
    major_name,
    year: year || latestProgram?.year || null,
    combination: latestProgram?.combination || null,
    combination_subjects: latestProgram?.combination_subjects || [],
    data_status: latestProgram?.data_status || 'MOCK',
    origin,
  };
}

export function targetPayloadFromPlan(plan, { label = 'Match', targetScore } = {}) {
  return {
    label,
    university_code: plan.university_code,
    university_name: plan.university_name,
    major_code: plan.major_code,
    major_name: plan.major_name,
    program_id: plan.program_id,
    year: plan.year,
    method: plan.method,
    method_label: plan.method_label || METHOD_LABELS[plan.method] || plan.method,
    combination: plan.combination,
    combination_subjects: plan.combination_subjects || [],
    benchmark_score: plan.benchmark_score,
    benchmark_scale: plan.benchmark_scale,
    benchmark_year: plan.benchmark_year,
    target_score: Number(targetScore),
    target_scale: plan.benchmark_scale,
    conditions: plan.conditions,
    source_name: plan.source_name,
    source_url: plan.source_url,
    data_status: plan.data_status,
  };
}