import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Upload,
  Globe,
  Mail,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Users,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudinaryTest } from '@/components/admin/CloudinaryTest';
import { DatabaseTest } from '@/components/admin/DatabaseTest';
import { analyticsService } from '@/services/AnalyticsService';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'एहसास Jewelry',
    siteDescription: 'Handcrafted Excellence in Jewelry',
    siteUrl: 'https://ehsaas-jewelry.com',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'noreply@ehsaas-jewelry.com',
    smtpPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    orderUpdates: true,
    stockAlerts: true,
    reviewNotifications: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordMinLength: '8',
    
    // Cloudinary Settings
    cloudinaryCloudName: 'djxv1usyv',
    cloudinaryApiKey: '879183339952735',
    cloudinaryUploadPreset: 'ml_default',
    
    // Analytics
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableTracking: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load analytics settings on component mount
  useEffect(() => {
    const loadAnalyticsSettings = async () => {
      try {
        const analyticsSettings = await analyticsService.getSettings();
        setSettings(prev => ({
          ...prev,
          googleAnalyticsId: analyticsSettings.googleAnalyticsId,
          facebookPixelId: analyticsSettings.facebookPixelId,
          enableTracking: analyticsSettings.enableTracking
        }));
      } catch (error) {
        console.error('Failed to load analytics settings:', error);
      }
    };
    
    loadAnalyticsSettings();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAnalyticsSettings = () => {
    const errors: Record<string, string> = {};
    
    if (settings.googleAnalyticsId && !analyticsService.validateGoogleAnalyticsId(settings.googleAnalyticsId)) {
      errors.googleAnalyticsId = 'Invalid Google Analytics ID format. Use GA-XXXXXXXXXX-X or G-XXXXXXXXXX format.';
    }
    
    if (settings.facebookPixelId && !analyticsService.validateFacebookPixelId(settings.facebookPixelId)) {
      errors.facebookPixelId = 'Invalid Facebook Pixel ID format. Use 15-16 digit number.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    
    try {
      // Validate analytics settings if saving integrations
      if (section === 'integrations') {
        if (!validateAnalyticsSettings()) {
          toast({
            title: 'Validation Error',
            description: 'Please fix the validation errors before saving.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        // Update analytics service settings
        await analyticsService.updateSettings({
          googleAnalyticsId: settings.googleAnalyticsId,
          facebookPixelId: settings.facebookPixelId,
          enableTracking: settings.enableTracking
        });
        
        console.log('✅ Analytics settings updated and reloaded');
      }
      
      // Simulate API call for other settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings Saved',
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been saved successfully.`,
      });
      
      console.log(`Saving ${section} settings:`, settings);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Configure your application settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Backup Data
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic configuration for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('general')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                  placeholder="your-email@domain.com"
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('email')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="orderUpdates">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                  </div>
                  <Switch
                    id="orderUpdates"
                    checked={settings.orderUpdates}
                    onCheckedChange={(checked) => handleInputChange('orderUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stockAlerts">Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Low stock notifications</p>
                  </div>
                  <Switch
                    id="stockAlerts"
                    checked={settings.stockAlerts}
                    onCheckedChange={(checked) => handleInputChange('stockAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reviewNotifications">Review Notifications</Label>
                    <p className="text-sm text-muted-foreground">New product reviews</p>
                  </div>
                  <Switch
                    id="reviewNotifications"
                    checked={settings.reviewNotifications}
                    onCheckedChange={(checked) => handleInputChange('reviewNotifications', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('notifications')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                    type="number"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('security')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Cloudinary */}
            <Card>
              <CardHeader>
                <CardTitle>Cloudinary Configuration</CardTitle>
                <CardDescription>Image storage and optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                    <Input
                      id="cloudinaryCloudName"
                      value={settings.cloudinaryCloudName}
                      onChange={(e) => handleInputChange('cloudinaryCloudName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cloudinaryApiKey">API Key</Label>
                    <Input
                      id="cloudinaryApiKey"
                      value={settings.cloudinaryApiKey}
                      onChange={(e) => handleInputChange('cloudinaryApiKey', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cloudinaryUploadPreset">Upload Preset</Label>
                  <Input
                    id="cloudinaryUploadPreset"
                    value={settings.cloudinaryUploadPreset}
                    onChange={(e) => handleInputChange('cloudinaryUploadPreset', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Analytics Integration
                </CardTitle>
                <CardDescription>Connect with analytics platforms to track visitor behavior and conversions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <div className="relative">
                    <Input
                      id="googleAnalyticsId"
                      value={settings.googleAnalyticsId}
                      onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                      placeholder="GA-XXXXXXXXX-X or G-XXXXXXXXXX"
                      className={validationErrors.googleAnalyticsId ? "border-red-500" : ""}
                    />
                    {settings.googleAnalyticsId && !validationErrors.googleAnalyticsId && (
                      <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                    )}
                    {validationErrors.googleAnalyticsId && (
                      <X className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {validationErrors.googleAnalyticsId && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.googleAnalyticsId}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports both GA4 (G-XXXXXXXXXX) and Universal Analytics (UA-XXXXXXXX-X) formats
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <div className="relative">
                    <Input
                      id="facebookPixelId"
                      value={settings.facebookPixelId}
                      onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                      placeholder="123456789012345"
                      className={validationErrors.facebookPixelId ? "border-red-500" : ""}
                    />
                    {settings.facebookPixelId && !validationErrors.facebookPixelId && (
                      <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                    )}
                    {validationErrors.facebookPixelId && (
                      <X className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {validationErrors.facebookPixelId && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.facebookPixelId}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Facebook Pixel ID should be a 15-16 digit number
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableTracking"
                        checked={settings.enableTracking}
                        onCheckedChange={(checked) => handleInputChange('enableTracking', checked)}
                      />
                      <div>
                        <Label htmlFor="enableTracking" className="font-medium">Enable Tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          {settings.enableTracking 
                            ? "Tracking is active - scripts will be injected" 
                            : "Tracking is disabled - no scripts will be loaded"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Google Analytics</span>
                      {settings.googleAnalyticsId && !validationErrors.googleAnalyticsId ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {settings.googleAnalyticsId && !validationErrors.googleAnalyticsId
                        ? "✅ Configured and ready"
                        : "❌ Not configured or invalid"}
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Facebook Pixel</span>
                      {settings.facebookPixelId && !validationErrors.facebookPixelId ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {settings.facebookPixelId && !validationErrors.facebookPixelId
                        ? "✅ Configured and ready"
                        : "❌ Not configured or invalid"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cloudinary Upload Test */}
            <Card>
              <CardHeader>
                <CardTitle>Cloudinary Upload Test</CardTitle>
                <CardDescription>Test your Cloudinary configuration and debug upload issues</CardDescription>
              </CardHeader>
              <CardContent>
                <CloudinaryTest />
              </CardContent>
            </Card>

            {/* Database Test */}
            <Card>
              <CardHeader>
                <CardTitle>Database Connection Test</CardTitle>
                <CardDescription>Test your Supabase database connection and product creation</CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseTest />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleSave('integrations')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Integration Settings'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                <span className="text-yellow-600">Warning:</span> These settings can affect system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Advanced settings should only be modified by experienced administrators. 
                  Incorrect configuration may cause system instability.
                </p>
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Database Maintenance
                </Button>
                <Button variant="outline" className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys Management
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import/Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}