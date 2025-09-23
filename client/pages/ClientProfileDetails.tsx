// ClientProfileDetails.tsx
import { useLocation, useParams } from "react-router-dom";
import { ClientProfile, ShareHolding } from "./ClientProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientProfileDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client as ClientProfile;

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
          <Button onClick={() => navigate("/client-profiles")} className="mt-4">
            Back to Client List
          </Button>
        </div>
      </div>
    );
  }

  // Add safe calculations with default values
  const totalShares = client.shareHoldings.reduce((sum, holding) => 
    sum + (holding.quantity || 0), 0);
  
  const totalInvestment = client.shareHoldings.reduce((sum, holding) => 
    sum + ((holding.quantity || 0) * (holding.faceValue || 0)), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Closed": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Suspended": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Safe formatting functions
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "—";
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "—";
    return value.toLocaleString();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  const getSafeValue = (value: any, defaultValue: any = "—") => {
    return value !== undefined && value !== null && value !== "" ? value : defaultValue;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/client-profiles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Profile Details</h1>
            <p className="text-muted-foreground">Profile ID: {client._id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center justify-between">
            <span>Basic Information</span>
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Shareholder Name</label>
            <div className="text-lg font-semibold">
              {getSafeValue(client.shareholderName.name1)}
              {client.shareholderName.name2 && `, ${client.shareholderName.name2}`}
              {client.shareholderName.name3 && `, ${client.shareholderName.name3}`}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
            <div className="text-lg font-mono font-semibold">{getSafeValue(client.panNumber)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Demat Account</label>
            <div className="text-lg font-semibold">{getSafeValue(client.dematAccountNumber)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Date</label>
            <div className="text-lg">{formatDate(client.currentDate)}</div>
          </div>
          
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <div className="text-lg">{getSafeValue(client.address)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
            <div className="text-lg font-semibold">{getSafeValue(client.bankDetails?.bankName)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Account Number</label>
            <div className="text-lg font-mono">{getSafeValue(client.bankDetails?.bankNumber)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Branch</label>
            <div className="text-lg">{getSafeValue(client.bankDetails?.branch)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
            <div className="text-lg font-mono font-semibold">{getSafeValue(client.bankDetails?.ifscCode)}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">MICR Code</label>
            <div className="text-lg font-mono">{getSafeValue(client.bankDetails?.micrCode)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Share Holdings Summary */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center justify-between">
            <span>Share Holdings Summary</span>
            <div className="flex space-x-4 text-sm">
              <span>Total Companies: {client.shareHoldings.length}</span>
              <span>Total Shares: {formatNumber(totalShares)}</span>
              <span className="font-semibold">
                Total Investment: {formatCurrency(totalInvestment)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Share Holdings Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Company #</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Company Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">ISIN Number</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Folio Number</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Certificate No.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Face Value</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Total Value</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Purchase Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Distinctive Numbers</th>
                </tr>
              </thead>
              <tbody>
                {client.shareHoldings.map((holding: ShareHolding, index: number) => {
                  // Safe values for each holding
                  const quantity = holding.quantity || 0;
                  const faceValue = holding.faceValue || 0;
                  const totalValue = quantity * faceValue;
                  
                  return (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="border border-gray-300 px-4 py-3 font-medium">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold">
                        {getSafeValue(holding.companyName)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-mono">
                        {getSafeValue(holding.isinNumber)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {getSafeValue(holding.folioNumber)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {getSafeValue(holding.certificateNumber)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatNumber(quantity)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatCurrency(faceValue)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {formatDate(holding.purchaseDate)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {holding.distinctiveNumber?.from || holding.distinctiveNumber?.to ? (
                          <span className="font-mono">
                            {getSafeValue(holding.distinctiveNumber?.from, "—")} to {getSafeValue(holding.distinctiveNumber?.to, "—")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {client.shareHoldings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No share holdings found for this client.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Remarks</label>
            <div className="text-lg p-3 border rounded-md bg-muted/20 min-h-[80px]">
              {getSafeValue(client.remarks, "No remarks provided")}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Dividend Information</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(client.dividend?.amount)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Date</label>
                  <div className="text-lg">
                    {formatDate(client.dividend?.date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={() => navigate("/client-profiles")}>
          Back to List
        </Button>
        <Button 
          onClick={() => navigate("/client-profiles", { 
            state: { editClient: client } 
          })}
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
}