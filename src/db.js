import { supabase } from './supabase'

// ─── Helper: convert app's camelCase to DB snake_case ────────
const toDbProject = (p) => ({
  id: p.id,
  job_number: p.jobNumber,
  job_name: p.jobName,
  client: p.client || '',
  prepared_by: p.preparedBy || '',
  milestones: p.tasks || p.milestones || [],
  equipment_owned: p.equipmentOwned || [],
  equipment_rented: p.equipmentRented || [],
})

const fromDbProject = (row) => ({
  id: row.id,
  jobNumber: row.job_number || '',
  jobName: row.job_name || '',
  client: row.client || '',
  preparedBy: row.prepared_by || '',
  tasks: row.milestones || [],
  equipmentOwned: row.equipment_owned || [],
  equipmentRented: row.equipment_rented || [],
})

// Strip base64 thumbnail data from photos before saving to Supabase
// URL is now a Supabase Storage public URL, so we keep it
// Thumbnail is still base64 for quick local display, so we strip it
const stripPhotoData = (photos) =>
  (photos || []).map(({ thumb, ...rest }) => rest);

const toDbDaily = (r) => ({
  id: r.id,
  project_id: r.projectId,
  date: r.date,
  day: r.day || '',
  weather: r.weather || '',
  temperature: r.temperature || '',
  rainfall: r.rainfall || '',
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
  task_hours: r.taskHours || [],
  photos: stripPhotoData(r.photos),
  prepared_by: r.preparedBy || '',
})

const fromDbDaily = (row) => ({
  id: row.id,
  projectId: row.project_id,
  date: row.date,
  day: row.day || '',
  weather: row.weather || '',
  temperature: row.temperature || '',
  rainfall: row.rainfall || '',
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
  taskHours: row.task_hours || [],
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
  selected_photos: stripPhotoData(w.selectedPhotos),
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

// Check if a URL is a base64 data URL (needs to be uploaded to cloud)
export function isBase64Url(url) {
  return url && typeof url === 'string' && url.startsWith('data:')
}

// Convert base64 data URL to Blob for uploading
function base64ToBlob(base64) {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(parts[1])
  const arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) {
    arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([arr], { type: mime })
}

export async function uploadPhoto(file, projectId, reportId) {
  // If no supabase or offline, store as base64 (will sync later)
  if (!supabase || !navigator.onLine) {
    // Return base64 data URL - will be synced when online
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ url: e.target.result, path: null, pendingUpload: true })
      reader.readAsDataURL(file)
    })
  }
  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `${projectId}/${reportId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('project-photos').upload(path, file)
  if (error) {
    console.error('uploadPhoto error:', error)
    // On error, fall back to base64 (will try to sync later)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ url: e.target.result, path: null, pendingUpload: true })
      reader.readAsDataURL(file)
    })
  }
  const { data: { publicUrl } } = supabase.storage.from('project-photos').getPublicUrl(path)
  return { url: publicUrl, path }
}

// Upload a base64 photo to Supabase (for syncing offline photos)
// Returns the original base64 URL if upload fails - never loses data
export async function uploadBase64Photo(base64Url, projectId, reportId, retries = 2) {
  // Validate inputs
  if (!base64Url || typeof base64Url !== 'string' || !base64Url.startsWith('data:')) {
    return { url: base64Url, path: null, pendingUpload: false } // Not a valid base64, skip
  }
  if (!supabase || !navigator.onLine) {
    return { url: base64Url, path: null, pendingUpload: true }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const blob = base64ToBlob(base64Url)
      if (!blob || blob.size === 0) {
        console.error('uploadBase64Photo: Failed to convert base64 to blob')
        return { url: base64Url, path: null, pendingUpload: true }
      }

      const path = `${projectId}/${reportId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
      const { error } = await supabase.storage.from('project-photos').upload(path, blob)

      if (error) {
        console.error(`uploadBase64Photo attempt ${attempt + 1} failed:`, error.message)
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1))) // Backoff
          continue
        }
        return { url: base64Url, path: null, pendingUpload: true }
      }

      const { data: { publicUrl } } = supabase.storage.from('project-photos').getPublicUrl(path)
      return { url: publicUrl, path, pendingUpload: false }
    } catch (err) {
      console.error(`uploadBase64Photo attempt ${attempt + 1} error:`, err.message)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      return { url: base64Url, path: null, pendingUpload: true }
    }
  }
  return { url: base64Url, path: null, pendingUpload: true }
}

export async function deletePhoto(path) {
  if (!supabase || !path) return
  const { error } = await supabase.storage.from('project-photos').remove([path])
  if (error) console.error('deletePhoto error:', error)
}
