{{- define "couchbase-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "couchbase-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- include "couchbase-app.name" . }}
{{- end }}
{{- end }}

{{- define "couchbase-app.labels" -}}
app.kubernetes.io/name: {{ include "couchbase-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "couchbase-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "couchbase-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}