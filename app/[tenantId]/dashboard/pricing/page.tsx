"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash, Save } from "lucide-react"

export default function PricingPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  // In a real implementation, you would fetch this data from your backend
  const [pricingRules, setPricingRules] = useState([
    {
      id: "1",
      name: "Standard Assessment",
      type: "assessment",
      basePrice: 99.99,
      vehicleType: "all",
      active: true,
    },
    {
      id: "2",
      name: "Premium Assessment",
      type: "assessment",
      basePrice: 149.99,
      vehicleType: "luxury",
      active: true,
    },
    {
      id: "3",
      name: "Quick Check",
      type: "assessment",
      basePrice: 49.99,
      vehicleType: "all",
      active: true,
    },
    {
      id: "4",
      name: "Regular Maintenance",
      type: "service",
      basePrice: 79.99,
      vehicleType: "all",
      active: true,
    },
    {
      id: "5",
      name: "Tire Replacement",
      type: "service",
      basePrice: 199.99,
      vehicleType: "all",
      active: true,
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    type: "assessment",
    basePrice: 0,
    vehicleType: "all",
    active: true,
  })

  const handleAddRule = () => {
    if (newRule.name && newRule.basePrice > 0) {
      setPricingRules([
        ...pricingRules,
        {
          id: `${pricingRules.length + 1}`,
          ...newRule,
        },
      ])

      // Reset form
      setNewRule({
        name: "",
        type: "assessment",
        basePrice: 0,
        vehicleType: "all",
        active: true,
      })
    }
  }

  const handleDeleteRule = (id: string) => {
    setPricingRules(pricingRules.filter((rule) => rule.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setPricingRules(pricingRules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="add">Add New Rule</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>Manage your pricing rules for assessments and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="capitalize">{rule.type}</TableCell>
                        <TableCell>${rule.basePrice.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{rule.vehicleType}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              rule.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {rule.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleToggleActive(rule.id)}>
                              {rule.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Pricing Rule</CardTitle>
              <CardDescription>Create a new pricing rule for assessments or services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Standard Assessment"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newRule.type} onValueChange={(value) => setNewRule({ ...newRule, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newRule.basePrice || ""}
                    onChange={(e) => setNewRule({ ...newRule, basePrice: Number.parseFloat(e.target.value) })}
                    placeholder="e.g. 99.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={newRule.vehicleType}
                    onValueChange={(value) => setNewRule({ ...newRule, vehicleType: value })}
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
