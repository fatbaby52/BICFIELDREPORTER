import { supabase } from './supabase'

// ─── Helper: convert app's camelCase to DB snake_case ────────
const toDbProject = (p) => ({
  id: p.id,
  job_number: p.jobNumber,
  job_name: p.jobName,
  client: p.client || '',
  prepared_by: p.preparedBy || '',
  milestones: p.milestones || [],
  equipment_owned: p.equipmentOwned || [],
  equipment_rented: p.equipmentRented || [],
})

const fromDbProject = (row) => ({
  id: row.id,
  jobNumber: row.job_number || '',
  jobName: row.job_name || '',
  client: row.client || '',
  preparedBy: row.prepared_by || '',
  milestones: row.milestones || [],
  equipmentOwned: row.equipment_owned || [],
  equipmentRented: row.equipment_rented || [],
})

const toDbDaily = (r) => ({
  id: r.id,
  project_id: r.projectId,
  date: r.date,
  day: r.day || '',
  weather: r.weather || '',
  incidents: r.incidents || 'N/A',
  shift: r.shift || { type: 'Day', hours: '8hr' },
  general_notes: r.generalNotes || '',
  workforce: r.workforce || {},
  equipment_present: r.equipmentPresent || [],
  equipment_down: r.equipmentDown || [],
  third_party_utilities: r.thirdPartyUtilities || '',
  material_deliveries: r.materialDeliveries || '',
  delays_problems: r.delaysProblems || '',
  extra_work: r.extraWork || '',
  milestone_hit: r.milestoneHit || null,
  photos: r.photos || [],
  prepared_by: r.preparedBy || '',
})

const fromDbDaily = (row) => ({
  id: row.id,
  projectId: row.project_id,
  date: row.date,
  day: row.day || '',
  weather: row.weather || '',
  incidents: row.incidents || 'N/A',
  shift: row.shift || { type: 'Day', hours: '8hr' },
  generalNotes: row.general_notes || '',
  workforce: row.workforce || {},
  equipmentPresent: row.equipment_present || [],
  equipmentDown: row.equipment_down || [],
  thirdPartyUtilities: row.third_party_utilities || '',
  materialDeliveries: row.material_deliveries || '',
  delaysProblems: row.delays_problems || '',
  extraWork: row.extra_work || '',
  milestoneHit: row.milestone_hit || null,
  photos: row.photos || [],
  preparedBy: row.prepared_by || '',
})

const toDbWeekly = (w) => ({
  id: w.id,
  project_id: w.projectId,
  week_ending: w.weekEnding,
  ongoing_completed: w.ongoingCompleted || [],
  look_ahead: w.lookAhead || [],
  outstanding_rfis: w.outstandingRFIs || '',
  hot_submittals: w.hotSubmittals || '',
  safety: w.safety || 'No incidents',
  important_dates: w.importantDates || '',
  owner_delivery_dates: w.ownerDeliveryDates || '',
  outstanding_owner_items: w.outstandingOwnerItems || '',
  upcoming_inspections: w.upcomingInspections || '',
  hindrances: w.hindrances || '',
  additional_delays: w.additionalDelays || '',
  next_oac_meeting: w.nextOACMeeting || '',
  selected_photos: w.selectedPhotos || [],
})

const fromDbWeekly = (row) => ({
  id: row.id,
  projectId: row.project_id,
  weekEnding: row.week_ending,
  ongoingCompleted: row.ongoing_completed || [],
  lookAhead: row.look_ahead || [],
  outstandingRFIs: row.outstanding_rfis || '',
  hotSubmittals: row.hot_submittals || '',
  safety: row.safety || 'No incidents',
  importantDates: row.important_dates || '',
  ownerDeliveryDates: row.owner_delivery_dates || '',
  outstandingOwnerItems: row.outstanding_owner_items || '',
  upcomingInspections: row.upcoming_inspections || '',
  hindrances: row.hindrances || '',
  additionalDelays: row.additional_delays || '',
  nextOACMeeting: row.next_oac_meeting || '',
  selectedPhotos: row.selected_photos || [],
})

// ─── Projects ────────────────────────────────────────────────
export async function loadProjects() {
  if (!supabase) return []
  const { data, error } = await supabase.from('projects').select('*').order('created_at')
  if (error) { console.error('loadProjects error:', error); return [] }
  return data.map(fromDbProject)
}

export async function saveProject(project) {
  if (!supabase) return
  const { error } = await supabase.from('projects').upsert(toDbProject(project))
  if (error) console.error('saveProject error:', error)
}

export async function deleteProject(id) {
  if (!supabase) return
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) console.error('deleteProject error:', error)
}

// ─── Daily Reports ───────────────────────────────────────────
export async function loadDailyReports() {
  if (!supabase) return []
  const { data, error } = await supabase.from('daily_reports').select('*').order('date', { ascending: true })
  if (error) { console.error('loadDailyReports error:', error); return [] }
  return data.map(fromDbDaily)
}

export async function saveDailyReport(report) {
  if (!supabase) return
  const { error } = await supabase.from('daily_reports').upsert(toDbDaily(report))
  if (error) console.error('saveDailyReport error:', error)
}

export async function deleteDailyReport(id) {
  if (!supabase) return
  const { error } = await supabase.from('daily_reports').delete().eq('id', id)
  if (error) console.error('deleteDailyReport error:', error)
}

// ─── Weekly Reports ──────────────────────────────────────────
export async function loadWeeklyReports() {
  if (!supabase) return []
  const { data, error } = await supabase.from('weekly_reports').select('*').order('week_ending', { ascending: false })
  if (error) { console.error('loadWeeklyReports error:', error); return [] }
  return data.map(fromDbWeekly)
}

export async function saveWeeklyReport(report) {
  if (!supabase) return
  const { error } = await supabase.from('weekly_reports').upsert(toDbWeekly(report))
  if (error) console.error('saveWeeklyReport error:', error)
}

export async function deleteWeeklyReport(id) {
  if (!supabase) return
  const { error } = await supabase.from('weekly_reports').delete().eq('id', id)
  if (error) console.error('deleteWeeklyReport error:', error)
}

// ─── Photo Storage ───────────────────────────────────────────
export async function uploadPhoto(file, projectId, reportId) {
  if (!supabase) {
    // Fallback: return base64 data URL
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ url: e.target.result, path: null })
      reader.readAsDataURL(file)
    })
  }
  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `${projectId}/${reportId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('project-photos').upload(path, file)
  if (error) {
    console.error('uploadPhoto error:', error)
    return { url: '', path: null }
  }
  const { data: { publicUrl } } = supabase.storage.from('project-photos').getPublicUrl(path)
  return { url: publicUrl, path }
}

export async function deletePhoto(path) {
  if (!supabase || !path) return
  const { error } = await supabase.storage.from('project-photos').remove([path])
  if (error) console.error('deletePhoto error:', error)
}
