export interface Bin {
  id: string;
  name: string;
  created_at: string;
  request_count: number;
}

export interface CapturedRequest {
  id: string;
  bin_id: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string;
  size: number;
  seal: string;
  prev_seal: string;
  received_at: string;
}

export interface InspectionFinding {
  name: string;
  detail: string;
  kind: "info" | "warn";
}

export interface Inspection {
  contentType: string;
  bodyKind: "json" | "form" | "xml" | "text" | "empty";
  sizeBytes: number;
  keys: string[];
  findings: InspectionFinding[];
  preview: string;
  sealValid: boolean;
}
