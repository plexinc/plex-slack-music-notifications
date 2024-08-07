# Music-notifications Chart
===========

A Helm chart for deploying the Slack Music Notifications app

While Plex is responsible for maintaining this Helm chart, we cannot provide support for troubleshooting related to its usage. For community assistance, please visit our [support forums](https://forums.plex.tv/).

### Installation via Helm

1. Add the Helm chart repo

```bash
helm repo add plex https://raw.githubusercontent.com/plexinc/plex-slack-music-notifications/gh-pages
```

2. Inspect & modify the default values (optional)

```bash
helm show values plex/music-notifications > values.yaml
```

3. Install the chart

```bash
helm upgrade --install plex plex/music-notifications --values values.yaml
```

## Contributing

Before contributing, please read the [Code of Conduct](../../CODE_OF_CONDUCT.md).

## License

[GNU GPLv3](./LICENSE)


## Configuration

The following table lists the configurable parameters of the Music-notifications chart and their default values.

| Parameter                | Description             | Default        |
| ------------------------ | ----------------------- | -------------- |
| `image.registry` |  | `"index.docker.io"` |
| `image.repository` |  | `"plexinc/slack-music-notifications"` |
| `image.tag` |  | `"latest"` |
| `image.sha` |  | `""` |
| `image.pullPolicy` |  | `"IfNotPresent"` |
| `ingress.enabled` |  | `false` |
| `ingress.ingressClassName` |  | `"ingress-nginx"` |
| `ingress.url` |  | `""` |
| `ingress.annotations` |  | `{}` |
| `secret.externalSecretKey` |  | `""` |
| `secret.annotations` |  | `{}` |
| `secret.secretStore.name` |  | `""` |
| `secret.secretStore.kind` |  | `""` |
| `secret.data` |  | `{}` |
| `replicaCount` |  | `1` |
| `resources.limits.cpu` |  | `"100m"` |
| `resources.limits.memory` |  | `"256Mi"` |
| `imagePullSecrets` |  | `[]` |
| `nameOverride` |  | `""` |
| `fullnameOverride` |  | `""` |
| `service.type` |  | `"ClusterIP"` |
| `service.port` |  | `3000` |
| `service.annotations` |  | `{}` |
| `nodeSelector` |  | `{}` |
| `tolerations` |  | `[]` |
| `affinity` |  | `{}` |
| `priorityClassName` |  | `""` |
| `commonLabels` |  | `{}` |
| `extraEnv` |  | `{}` |

---
_Documentation generated by [Frigate](https://frigate.readthedocs.io)._
