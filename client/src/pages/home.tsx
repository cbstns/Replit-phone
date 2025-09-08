import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { phoneQueryRequestSchema, type PhoneQueryRequest, type AccountStatusResponse, type PhoneQuery } from "@shared/schema";
import { ChevronRight, Search, Check, AlertTriangle, HelpCircle, Phone, Settings, Clock, Book, LifeBuoy, RotateCcw, X } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const form = useForm<PhoneQueryRequest>({
    resolver: zodResolver(phoneQueryRequestSchema),
    defaultValues: {
      phoneNumber: "",
      serviceProviderId: "8349570948",
      requestId: "",
      consentGranted: true,
    },
  });

  // Query for recent queries
  const { data: recentQueries = [] } = useQuery<PhoneQuery[]>({
    queryKey: ["/api/recent-queries"],
  });

  // Mutation for checking account status
  const checkStatusMutation = useMutation({
    mutationFn: async (data: PhoneQueryRequest) => {
      const response = await apiRequest("POST", "/api/account-status", data);
      return await response.json() as AccountStatusResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent-queries"] });
      toast({
        title: "Success",
        description: "Account status checked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Mutation for clearing history
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/recent-queries");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent-queries"] });
      toast({
        title: "Success",
        description: "Query history cleared successfully",
      });
    },
  });

  const onSubmit = (data: PhoneQueryRequest) => {
    checkStatusMutation.mutate(data);
  };

  const repeatQuery = (query: PhoneQuery) => {
    form.setValue("phoneNumber", query.phoneNumber);
    form.setValue("serviceProviderId", query.serviceProviderId);
    if (query.requestId) {
      form.setValue("requestId", query.requestId);
    }
    form.setValue("consentGranted", query.consentGranted ?? true);
  };

  const result = checkStatusMutation.data;
  const isLoading = checkStatusMutation.isPending;
  const error = checkStatusMutation.error;

  const getStatusIcon = (status?: string, responseCode?: number) => {
    if (responseCode === 0) return <Check className="w-4 h-4" />;
    if (responseCode === 1) return <HelpCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusColor = (status?: string, responseCode?: number) => {
    if (responseCode === 0) return "bg-green-500";
    if (responseCode === 1) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusBadgeColor = (status?: string, responseCode?: number) => {
    if (responseCode === 0) return "bg-green-100 text-green-800";
    if (responseCode === 1) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Phone className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">EnStream Validator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                API Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Card */}
        <Card className="shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">Phone Number Account Status</h2>
            <p className="text-primary-foreground/80">Enter a phone number to check its account status using EnStream API</p>
          </div>

          {/* Form Section */}
          <div className="p-6 border-b border-border">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number (E.164 Format)
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (416) 555-0123"
                    data-testid="input-phone-number"
                    {...form.register("phoneNumber")}
                    className="w-full"
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Format: +1 (Country Code + Area Code + Number)
                  </p>
                </div>

                {/* Service Provider ID */}
                <div className="space-y-2">
                  <Label htmlFor="serviceProviderId" className="text-sm font-medium">
                    Service Provider ID
                  </Label>
                  <Input
                    id="serviceProviderId"
                    type="text"
                    placeholder="8349570948"
                    data-testid="input-service-provider-id"
                    {...form.register("serviceProviderId")}
                    className="w-full"
                  />
                  {form.formState.errors.serviceProviderId && (
                    <p className="text-sm text-destructive">{form.formState.errors.serviceProviderId.message}</p>
                  )}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="border-t border-border pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-advanced"
                >
                  <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                  Advanced Options
                </Button>

                {/* Advanced Options Panel */}
                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestId" className="text-sm font-medium">
                          Request ID (Optional)
                        </Label>
                        <Input
                          id="requestId"
                          type="text"
                          placeholder="Auto-generated UUID"
                          data-testid="input-request-id"
                          {...form.register("requestId")}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consentGranted"
                          checked={form.watch("consentGranted")}
                          onCheckedChange={(checked) => form.setValue("consentGranted", !!checked)}
                          data-testid="checkbox-consent-granted"
                        />
                        <Label htmlFor="consentGranted" className="text-sm">
                          Consent Granted
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-check-status"
                  className="inline-flex items-center px-6 py-3"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Checking..." : "Check Account Status"}
                </Button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div>
                  <p className="text-foreground font-medium">Checking Account Status</p>
                  <p className="text-muted-foreground text-sm">Connecting to EnStream API...</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && result.responseCode === 0 && (
            <div className="p-6 border-b border-border bg-green-50" data-testid="success-result">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="text-white w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Account Found</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-white border-green-200">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Phone Number</p>
                          <p className="text-sm font-mono text-green-900">{result.phoneNumber}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-green-200">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Account Status</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            {result.accountStatus}
                          </span>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-green-200">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Response Code</p>
                          <p className="text-sm font-mono text-green-900">{result.responseCode}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Card className="bg-white border-green-200">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">Request Details</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Request ID:</span>
                            <span className="font-mono ml-1">{result.requestId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Timestamp:</span>
                            <span className="ml-1">{result.timestamp}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {result && result.responseCode === 1 && (
            <div className="p-6 border-b border-border bg-amber-50" data-testid="not-found-result">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <HelpCircle className="text-white w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Account Not Found</h3>
                  <div className="space-y-3">
                    <Card className="bg-white border-amber-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-amber-800 mb-3">
                          No account found for this phone number, or the number is not whitelisted in the QA environment.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-amber-600 font-medium">Response Code:</span>
                            <span className="font-mono ml-1">{result.responseCode}</span>
                          </div>
                          <div>
                            <span className="text-amber-600 font-medium">Phone Number:</span>
                            <span className="font-mono ml-1">{result.phoneNumber}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 border-b border-border bg-red-50" data-testid="error-result">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-white w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Error</h3>
                  <div className="space-y-3">
                    <Card className="bg-white border-red-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-red-800 mb-2">{error.message}</p>
                        <ul className="text-xs text-red-600 space-y-1">
                          <li>• Must start with + followed by country code</li>
                          <li>• Example: +1 for US/Canada, +44 for UK</li>
                          <li>• Total length: 7-15 digits after country code</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => checkStatusMutation.reset()}
                      className="text-red-600 hover:text-red-800"
                      data-testid="button-clear-error"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* API Information Panel */}
        <Card className="mt-8 shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Settings className="w-5 h-5 mr-2 text-muted-foreground" />
              API Information
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Endpoint Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-muted-foreground w-20">Method:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-mono">POST</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20">URL:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      /api/rest/service/v1/accountStatus
                    </code>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20">Auth:</span>
                    <span className="text-foreground">Basic Authentication</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">Response Codes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="inline-flex items-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold justify-center mr-3">0</span>
                    <span className="text-foreground">Account Found & Active</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full text-xs font-bold justify-center mr-3">1</span>
                    <span className="text-foreground">Subscriber Not Found</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-xs font-bold justify-center mr-3">×</span>
                    <span className="text-foreground">Error or Special Condition</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card className="mt-8 shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                Recent Queries
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearHistoryMutation.mutate()}
                disabled={clearHistoryMutation.isPending}
                className="text-primary hover:text-primary/80"
                data-testid="button-clear-history"
              >
                Clear History
              </Button>
            </h3>
          </div>
          <CardContent className="p-6">
            {recentQueries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent queries found</p>
            ) : (
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div key={query.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`query-history-${query.id}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center w-8 h-8 rounded-full text-xs font-bold justify-center text-white ${getStatusColor(query.accountStatus, parseInt(query.responseCode || "0"))}`}>
                        {getStatusIcon(query.accountStatus, parseInt(query.responseCode || "0"))}
                      </span>
                      <div>
                        <p className="font-mono text-sm text-foreground">{query.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {query.timestamp ? format(new Date(query.timestamp), 'MMM d, h:mm a') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(query.accountStatus, parseInt(query.responseCode || "0"))}`}>
                        {query.accountStatus || (parseInt(query.responseCode || "0") === 1 ? "NOT FOUND" : "ERROR")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => repeatQuery(query)}
                        className="text-muted-foreground hover:text-foreground"
                        data-testid={`button-repeat-query-${query.id}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2024 EnStream Validator. Built with TypeScript & React.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Book className="w-4 h-4 mr-1 inline" />
                API Documentation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                <LifeBuoy className="w-4 h-4 mr-1 inline" />
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
