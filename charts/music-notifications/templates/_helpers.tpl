{{/*
Expand the name of the chart.
*/}}
{{- define "music-notifications.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "music-notifications.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "music-notifications.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
The image to use for pms
*/}}
{{- define "music-notifications.image" -}}
{{- if .Values.image.sha }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s@%s" .Values.global.imageRegistry .Values.image.repository (default ("latest") .Values.image.tag) .Values.image.sha }}
{{- else }}
{{- printf "%s/%s:%s@%s" .Values.image.registry .Values.image.repository (default ("latest") .Values.image.tag) .Values.image.sha }}
{{- end }}
{{- else }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s" .Values.global.imageRegistry .Values.image.repository (default ( "latest") .Values.image.tag) }}
{{- else }}
{{- printf "%s/%s:%s" .Values.image.registry .Values.image.repository (default ( "latest") .Values.image.tag) }}
{{- end }}
{{- end }}
{{- end }}

{{/*
The image to use for the init containers
*/}}
{{- define "music-notifications.init_image" -}}
{{- if .Values.initContainer.image.sha }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s@%s" .Values.global.imageRegistry .Values.initContainer.image.repository (default ("latest") .Values.initContainer.image.tag) .Values.initContainer.image.sha }}
{{- else }}
{{- printf "%s/%s:%s@%s" .Values.initContainer.image.registry .Values.initContainer.image.repository (default ("latest") .Values.initContainer.image.tag) .Values.initContainer.image.sha }}
{{- end }}
{{- else }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s" .Values.global.imageRegistry .Values.initContainer.image.repository (default ( "latest") .Values.initContainer.image.tag) }}
{{- else }}
{{- printf "%s/%s:%s" .Values.initContainer.image.registry .Values.initContainer.image.repository (default ( "latest") .Values.initContainer.image.tag) }}
{{- end }}
{{- end }}
{{- end }}

{{/*
The image to use for rclone
*/}}
{{- define "music-notifications.rclone_image" -}}
{{- if .Values.rclone.image.sha }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s@%s" .Values.global.imageRegistry .Values.rclone.image.repository (default ("latest") .Values.rclone.image.tag) .Values.rclone.image.sha }}
{{- else }}
{{- printf "%s/%s:%s@%s" .Values.rclone.image.registry .Values.rclone.image.repository (default ("latest") .Values.rclone.image.tag) .Values.rclone.image.sha }}
{{- end }}
{{- else }}
{{- if .Values.global.imageRegistry }}
{{- printf "%s/%s:%s" .Values.global.imageRegistry .Values.rclone.image.repository (default ( "latest") .Values.rclone.image.tag) }}
{{- else }}
{{- printf "%s/%s:%s" .Values.rclone.image.registry .Values.rclone.image.repository (default ( "latest") .Values.rclone.image.tag) }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "music-notifications.labels" -}}
app: {{ template "music-notifications.name" . }}
helm.sh/chart: {{ include "music-notifications.chart" . }}
{{ include "music-notifications.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.commonLabels}}
{{ toYaml .Values.commonLabels }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "music-notifications.selectorLabels" -}}
app.kubernetes.io/name: {{ include "music-notifications.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "music-notifications.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "music-notifications.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
