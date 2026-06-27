# Enterprise Deployment Strategy

To deploy this companion extension across an organization without relying on the public Chrome Web Store, utilize the standard enterprise force-install policies.

### 1. Google Admin Console (ChromeOS / Managed Chrome Profiles)
1. Go to **Devices > Chrome > Apps & extensions > Users & browsers**.
2. Select the specific Organizational Unit (OU).
3. Click the `+` button -> **Add from custom URL** (or upload the `.crx` directly).
4. Set the installation policy to **Force install**.

### 2. Windows Registry (GPO Deployment)
Distribute this registry key via Active Directory GPO:
```text
Path: HKLM\Software\Policies\Google\Chrome\ExtensionInstallForcelist
Name: 1
Type: REG_SZ
Value: <extension-id>;<update-url>
```
