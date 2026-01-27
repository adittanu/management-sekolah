import * as React from "react"
import { useState } from "react"
import { useForm } from "@inertiajs/react"
import axios from 'axios'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Progress } from "@/Components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { cn } from "@/lib/utils"

interface ImportUserWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 1 | 2 | 3 | 4

interface PreviewRow {
  [key: string]: string
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

const DB_COLUMNS = [
  { value: "name", label: "Full Name" },
  { value: "firstname", label: "First Name" },
  { value: "lastname", label: "Last Name" },
  { value: "email", label: "Email Address" },
  { value: "password", label: "Password" },
  { value: "username", label: "Username / NIS / NIP" },
  { value: "cohort1", label: "Cohort / Class / Role" },
  { value: "role", label: "Role (Direct)" },
  { value: "phone", label: "Phone Number" },
  { value: "address", label: "Address" },
]

export function ImportUserWizard({ isOpen, onClose, onSuccess }: ImportUserWizardProps) {
  const [step, setStep] = useState<Step>(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [isDragActive, setIsDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    file: null as File | null,
    mapping: {} as Record<string, string>,
  })

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

// removed extra imports
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = async (selectedFile: File) => {
    const validTypes = [
      "text/csv", 
      "application/vnd.ms-excel", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]
    
    // Check extension as fallback
    const validExtensions = [".csv", ".xls", ".xlsx"]
    const hasValidExt = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))

    if (!validTypes.includes(selectedFile.type) && !hasValidExt) {
      alert("Please upload a valid CSV or Excel file.")
      return
    }

    setFile(selectedFile)
    setData("file", selectedFile)
    
    // Upload for preview using axios
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
        const response = await axios.post(route('admin.user.import.preview'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })

        const data = response.data
        if (data.preview) {
            setHeaders(data.preview.header)
            
            // Map preview rows to object structure
            const previewRows = data.preview.data.map((row: any[]) => {
                const rowObj: PreviewRow = {}
                data.preview.header.forEach((h: string, i: number) => {
                    rowObj[h] = row[i]
                })
                return rowObj
            })
            setPreviewData(previewRows)

            // Auto-mapping
            const initialMapping: Record<string, string> = {}
            data.preview.header.forEach((header: string) => {
                const lower = header.toLowerCase()
                
                // Try exact match first
                const matched = DB_COLUMNS.find(col => col.value === lower || col.label.toLowerCase() === lower)
                if (matched) {
                    initialMapping[header] = matched.value
                } else {
                    // Fuzzy matching
                    if (lower.includes('email')) initialMapping[header] = 'email';
                    else if (lower === 'firstname' || (lower.includes('name') && lower.includes('first'))) initialMapping[header] = 'firstname';
                    else if (lower === 'lastname' || (lower.includes('name') && lower.includes('last'))) initialMapping[header] = 'lastname';
                    else if (lower.includes('pass')) initialMapping[header] = 'password';
                    else if (lower.includes('cohort') || lower.includes('class')) initialMapping[header] = 'cohort1';
                    else if (lower.includes('user') || lower.includes('nis') || lower.includes('nip')) initialMapping[header] = 'username';
                    else if (lower.includes('name') && !lower.includes('user')) initialMapping[header] = 'name'; 
                }
            })
            
            setMapping(initialMapping)
            setData("mapping", initialMapping)
        }
    } catch (error: any) {
        console.error("Preview error:", error)
        // More descriptive error handling
        let errorMessage = "Failed to read file."
        if (error.response) {
            errorMessage += ` Server responded with ${error.response.status}: ${JSON.stringify(error.response.data)}`
        } else if (error.request) {
            errorMessage += " No response received from server."
        } else {
            errorMessage += " Request setup failed."
        }
        
        alert(errorMessage)
        setFile(null)
    }
  }

  const handleMappingChange = (csvHeader: string, dbColumn: string) => {
    const newMapping = { ...mapping, [csvHeader]: dbColumn }
    setMapping(newMapping)
    setData("mapping", newMapping)
  }

  const handleImport = () => {
    setStep(3)
    setProgress(10)
    
    // Simulate progress while request is processing (fake progress for UX)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90
        return prev + 10
      })
    }, 500)

    post(route("admin.user.import"), {
      onSuccess: (page) => {
        clearInterval(interval)
        setProgress(100)
        // Ideally the backend would return stats, mocking for now if not in flash
        setImportResult({
          success: (page.props.flash as any)?.success_count || previewData.length, // Fallback/Mock
          failed: (page.props.flash as any)?.failed_count || 0,
          errors: (page.props.flash as any)?.error_messages || []
        })
        setStep(4)
        if (onSuccess) onSuccess()
      },
      onError: () => {
        clearInterval(interval)
        setProgress(0)
        setStep(2) // Go back to mapping on error
      }
    })
  }

  const resetWizard = () => {
    setStep(1)
    setFile(null)
    setPreviewData([])
    setHeaders([])
    setMapping({})
    setImportResult(null)
    reset()
  }

  const handleClose = () => {
    resetWizard()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Bulk import users from CSV. Follow the steps below.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {["Upload", "Map Columns", "Importing", "Result"].map((label, index) => {
            const stepNum = index + 1 as Step
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            
            return (
              <div key={label} className="flex flex-col items-center relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
                  isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : 
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>{label}</span>
              </div>
            )
          })}
          {/* Connecting Line */}
          <div className="absolute top-[5.5rem] left-[3.5rem] right-[3.5rem] h-[2px] bg-muted -z-0 hidden sm:block">
             <div 
               className="h-full bg-primary transition-all duration-300" 
               style={{ width: `${((step - 1) / 3) * 100}%` }}
             />
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                file ? "bg-green-50 border-green-200" : ""
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              
              {file ? (
                <div className="flex flex-col items-center text-green-600">
                  <FileText className="w-12 h-12 mb-4" />
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-green-500">{(file.size / 1024).toFixed(2)} KB</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Upload className="w-12 h-12 mb-4" />
                  <p className="font-medium text-lg mb-1">Drag & Drop or Click to Upload</p>
                  <p className="text-sm">Supports .xlsx, .xls, .csv</p>
                </div>
              )}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> File Format Guide
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Supported formats: Excel (.xlsx, .xls) and CSV</li>
                <li>File must include a header row</li>
                <li>Recommended columns: Name, Email, Role, Password</li>
                <li>Email must be unique</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Map */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">CSV Column</TableHead>
                    <TableHead className="w-[200px]">Map To</TableHead>
                    <TableHead>Preview (First Row)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {headers.map((header, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell>
                        <Select 
                          value={mapping[header] || ""} 
                          onValueChange={(value) => handleMappingChange(header, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Skip column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ignore">-- Skip --</SelectItem>
                            {DB_COLUMNS.map(col => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {previewData[0]?.[header]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Data Preview Table */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Data Preview (First 5 Rows)</h4>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h, i) => (
                        <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((h, j) => (
                          <TableCell key={j} className="whitespace-nowrap">{row[h]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {progress}%
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Importing Users...</h3>
              <p className="text-muted-foreground">Please wait while we process your file.</p>
            </div>
            <div className="w-full max-w-md">
               <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && importResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                <div className="text-sm text-green-600">Successfully Imported</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{importResult.failed}</div>
                <div className="text-sm text-red-600">Failed Records</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="border border-red-200 rounded-md bg-red-50 p-4">
                <h4 className="font-semibold text-red-800 mb-2">Error Log</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center w-full">
          <div>
             {step === 2 && (
               <Button variant="outline" onClick={() => setStep(1)} disabled={processing}>
                 <ArrowLeft className="w-4 h-4 mr-2" /> Back
               </Button>
             )}
          </div>
          
          <div className="flex gap-2">
            {step === 1 && (
              <Button onClick={() => setStep(2)} disabled={!file}>
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {step === 2 && (
              <Button onClick={handleImport} disabled={processing || Object.keys(mapping).length === 0}>
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...
                  </>
                ) : (
                  <>Start Import</>
                )}
              </Button>
            )}
            
            {step === 4 && (
              <Button onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
