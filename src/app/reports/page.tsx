import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Landmark } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in-0 duration-500">
            <header>
                <h1 className="text-3xl font-bold font-headline">Tax Reports</h1>
                <p className="text-muted-foreground">Generate your UK tax reports for crypto assets.</p>
            </header>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Generate New Report</CardTitle>
                    <CardDescription>Select the tax year to generate a report for.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <Select defaultValue="2023-2024">
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Select tax year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2022-2023">2022-2023</SelectItem>
                            <SelectItem value="2021-2022">2021-2022</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="lg" className="w-full sm:w-auto">Generate Report</Button>
                </CardContent>
            </Card>

             <Card className="max-w-2xl bg-gradient-to-br from-primary/10 to-background">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">UK Tax Report 2023-2024</CardTitle>
                        <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="accent" size="sm" className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Download PDF
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-background/50 p-4">
                        <p className="text-sm text-muted-foreground">Total Gains</p>
                        <p className="text-2xl font-bold text-accent">£12,480.50</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-4">
                        <p className="text-sm text-muted-foreground">Total Losses</p>
                        <p className="text-2xl font-bold text-destructive">£3,120.75</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-4">
                        <p className="text-sm text-muted-foreground">Net Taxable</p>
                        <p className="text-2xl font-bold">£9,359.75</p>
                    </div>
                </CardContent>
             </Card>
        </div>
    );
}
