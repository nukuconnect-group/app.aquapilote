
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Plus, Users, TrendingUp, Calendar, Download, FileText, Eye } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import { useSettings } from '@/contexts/SettingsContext';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  unitId: string;
  unitName: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'vacation';
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
}

interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  generatedAt: string;
}

const HRManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { units, activeUnit } = useProductionUnits();
  const { formatCurrency } = useSettings();

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPaySlipGenerator, setShowPaySlipGenerator] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    unitId: activeUnit?.id || '',
    salary: 0,
    hireDate: '',
    contractType: 'CDI' as 'CDI' | 'CDD' | 'Stage' | 'Freelance'
  });

  // Synchroniser avec l'unité active
  useEffect(() => {
    if (activeUnit?.id) {
      setEmployeeFormData(prev => ({ ...prev, unitId: activeUnit.id }));
    }
  }, [activeUnit?.id]);

  // Filtrer par unité active
  const filteredEmployees = useMemo(() => {
    if (!activeUnit?.id) return employees;
    return employees.filter(emp => emp.unitId === activeUnit.id);
  }, [employees, activeUnit?.id]);

  const filteredPaySlips = useMemo(() => {
    if (!activeUnit?.id) return paySlips;
    const unitEmployeeIds = employees.filter(emp => emp.unitId === activeUnit.id).map(emp => emp.id);
    return paySlips.filter(slip => unitEmployeeIds.includes(slip.employeeId));
  }, [paySlips, employees, activeUnit?.id]);

  const [paySlipData, setPaySlipData] = useState({
    employeeId: '',
    period: '',
    overtime: 0,
    bonuses: 0,
    deductions: 0
  });

  const positions = [
    'Directeur',
    'Responsable de production',
    'Responsable Grossissement',
    'Responsable Écloserie',
    'Technicien Aquacole',
    'Technicienne Écloserie',
    'Ouvrier Aquacole',
    'Comptable',
    'Secrétaire'
  ];

  const handleAddEmployee = () => {
    if (!employeeFormData.firstName || !employeeFormData.lastName || !employeeFormData.unitId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedUnit = units.find(u => u.id === employeeFormData.unitId);
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeFormData,
      unitName: selectedUnit?.name || '',
      status: 'active'
    };

    setEmployees([...employees, newEmployee]);
    addLog('Employé ajouté', 'RH', `${employeeFormData.firstName} ${employeeFormData.lastName} ajouté à ${selectedUnit?.name}`, 'success');
    
    toast({
      title: "Employé ajouté",
      description: `${employeeFormData.firstName} ${employeeFormData.lastName} a été ajouté avec succès`
    });

    resetEmployeeForm();
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      unitId: '',
      salary: 0,
      hireDate: '',
      contractType: 'CDI'
    });
    setShowEmployeeForm(false);
  };

  const generatePaySlip = () => {
    if (!paySlipData.employeeId || !paySlipData.period) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé et une période",
        variant: "destructive"
      });
      return;
    }

    const employee = employees.find(e => e.id === paySlipData.employeeId);
    if (!employee) return;

    const grossSalary = employee.salary + paySlipData.overtime + paySlipData.bonuses;
    const netSalary = grossSalary - paySlipData.deductions;

    const newPaySlip: PaySlip = {
      id: Date.now().toString(),
      employeeId: paySlipData.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      period: paySlipData.period,
      baseSalary: employee.salary,
      overtime: paySlipData.overtime,
      bonuses: paySlipData.bonuses,
      deductions: paySlipData.deductions,
      netSalary: netSalary,
      generatedAt: new Date().toISOString().split('T')[0]
    };

    setPaySlips([...paySlips, newPaySlip]);
    addLog('Bulletin généré', 'RH', `Bulletin de paie généré pour ${employee.firstName} ${employee.lastName} - ${paySlipData.period}`, 'success');
    
    toast({
      title: "Bulletin généré",
      description: `Bulletin de paie créé pour ${employee.firstName} ${employee.lastName}`
    });

    setPaySlipData({
      employeeId: '',
      period: '',
      overtime: 0,
      bonuses: 0,
      deductions: 0
    });
    setShowPaySlipGenerator(false);
  };

  const downloadPaySlip = (paySlip: PaySlip) => {
    const employee = employees.find(e => e.id === paySlip.employeeId);
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulletin de Paie - ${paySlip.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .salary-details { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .salary-details th, .salary-details td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .salary-details th { background-color: #f2f2f2; }
            .total { font-weight: bold; background-color: #e3f2fd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BULLETIN DE PAIE</h1>
            <p>Période: ${paySlip.period}</p>
          </div>
          
          <div class="info">
            <div>
              <strong>Employé:</strong><br>
              ${paySlip.employeeName}<br>
              ${employee?.position}<br>
              Unité: ${employee?.unitName}
            </div>
            <div>
              <strong>Employeur:</strong><br>
              Ferme Piscicole Aqua-Plus<br>
              Date de génération: ${new Date(paySlip.generatedAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
          
          <table class="salary-details">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                 <td>Salaire de base</td>
                <td>${formatCurrency(paySlip.baseSalary)}</td>
              </tr>
              <tr>
                <td>Heures supplémentaires</td>
                <td>${formatCurrency(paySlip.overtime)}</td>
              </tr>
              <tr>
                <td>Primes</td>
                <td>${formatCurrency(paySlip.bonuses)}</td>
              </tr>
              <tr>
                <td>Cotisations sociales</td>
                <td>-${formatCurrency(paySlip.deductions)}</td>
              </tr>
              <tr class="total">
                <td><strong>SALAIRE NET</strong></td>
                <td><strong>${formatCurrency(paySlip.netSalary)}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulletin_paie_${paySlip.employeeName.replace(' ', '_')}_${paySlip.period}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hrStats = {
    totalEmployees: filteredEmployees.length,
    activeEmployees: filteredEmployees.filter(e => e.status === 'active').length,
    totalPayroll: filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0),
    avgSalary: filteredEmployees.length > 0 ? filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0) / filteredEmployees.length : 0
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 rounded-xl text-white">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Gestion des Ressources Humaines</h2>
              <p className="text-sm md:text-base text-blue-100">Personnel, paie et administration RH</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto text-sm md:text-base" 
                onClick={() => setShowPaySlipGenerator(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer Bulletin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto text-sm md:text-base" 
                onClick={() => setShowEmployeeForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Employé
              </Button>
            </div>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      {/* KPIs RH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold truncate">{hrStats.totalEmployees}</p>
                <p className="text-xs md:text-sm text-gray-600">Employés total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold truncate">{hrStats.activeEmployees}</p>
                <p className="text-xs md:text-sm text-gray-600">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base md:text-2xl font-bold truncate">{formatCurrency(hrStats.totalPayroll)}</p>
                <p className="text-xs md:text-sm text-gray-600">Masse salariale</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base md:text-2xl font-bold truncate">{formatCurrency(Math.round(hrStats.avgSalary))}</p>
                <p className="text-xs md:text-sm text-gray-600">Salaire moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-3 md:space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid grid-cols-3 w-full text-xs md:text-sm">
            <TabsTrigger value="employees">Employés</TabsTrigger>
            <TabsTrigger value="payroll">Bulletins</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Liste des Employés</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-3 md:p-6">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun employé enregistré{activeUnit ? ` pour ${activeUnit.name}` : ''}</p>
                  <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Nouvel Employé" pour ajouter votre premier employé</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs lg:text-sm">Nom</TableHead>
                          <TableHead className="text-xs lg:text-sm">Poste</TableHead>
                          <TableHead className="text-xs lg:text-sm">Unité</TableHead>
                          <TableHead className="text-xs lg:text-sm">Salaire</TableHead>
                          <TableHead className="text-xs lg:text-sm">Statut</TableHead>
                          <TableHead className="text-xs lg:text-sm">Contrat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-xs lg:text-sm">{employee.firstName} {employee.lastName}</p>
                                <p className="text-xs text-muted-foreground">{employee.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs lg:text-sm">{employee.position}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {employee.unitName}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs lg:text-sm">{formatCurrency(employee.salary)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(employee.status) + " text-xs"}>
                                {employee.status === 'active' ? 'Actif' : 
                                 employee.status === 'inactive' ? 'Inactif' : 'Congés'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{employee.contractType}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3 p-3">
                    {filteredEmployees.map((employee) => (
                      <Card key={employee.id} className="border">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-sm">{employee.firstName} {employee.lastName}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge variant="outline" className="text-xs">{employee.position}</Badge>
                              <Badge variant="outline" className="text-xs">{employee.unitName}</Badge>
                              <Badge className={getStatusColor(employee.status) + " text-xs"}>
                                {employee.status === 'active' ? 'Actif' : 
                                 employee.status === 'inactive' ? 'Inactif' : 'Congés'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">{employee.contractType}</Badge>
                            </div>
                            <p className="text-sm font-medium">{formatCurrency(employee.salary)}/mois</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Bulletins de Paie</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPaySlips.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun bulletin de paie généré{activeUnit ? ` pour ${activeUnit.name}` : ''}</p>
                  <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Générer Bulletin" pour créer un bulletin de paie</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Salaire Base</TableHead>
                      <TableHead>Heures Sup.</TableHead>
                      <TableHead>Primes</TableHead>
                      <TableHead>Cotisations</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaySlips.map((paySlip) => (
                      <TableRow key={paySlip.id}>
                        <TableCell>{paySlip.employeeName}</TableCell>
                        <TableCell>{paySlip.period}</TableCell>
                        <TableCell>{formatCurrency(paySlip.baseSalary)}</TableCell>
                        <TableCell>{formatCurrency(paySlip.overtime)}</TableCell>
                        <TableCell>{formatCurrency(paySlip.bonuses)}</TableCell>
                        <TableCell>{formatCurrency(paySlip.deductions)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(paySlip.netSalary)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPaySlip(paySlip)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Unité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {units.map(unit => {
                    const unitEmployees = employees.filter(emp => emp.unitId === unit.id);
                    return (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{unit.name}</p>
                          <Badge variant="outline" className="text-xs">{unit.type}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{unitEmployees.length} employés</p>
                           <p className="text-sm text-gray-600">
                            {formatCurrency(unitEmployees.reduce((sum, emp) => sum + emp.salary, 0))}/mois
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicateurs RH</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Taux de rotation:</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ancienneté moyenne:</span>
                    <span className="font-medium">18 mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coût RH/CA:</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absentéisme:</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nouvel Employé */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={employeeFormData.firstName}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input
                  value={employeeFormData.lastName}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={employeeFormData.phone}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Poste *</Label>
              <Select value={employeeFormData.position} onValueChange={(value) => setEmployeeFormData({...employeeFormData, position: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unité de rattachement *</Label>
              <Select value={employeeFormData.unitId} onValueChange={(value) => setEmployeeFormData({...employeeFormData, unitId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {unit.type}
                        </Badge>
                        {unit.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Salaire (€) *</Label>
                <Input
                  type="number"
                  value={employeeFormData.salary}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, salary: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Date d'embauche</Label>
                <Input
                  type="date"
                  value={employeeFormData.hireDate}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, hireDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Type de contrat</Label>
                <Select value={employeeFormData.contractType} onValueChange={(value: 'CDI' | 'CDD' | 'Stage' | 'Freelance') => setEmployeeFormData({...employeeFormData, contractType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetEmployeeForm}>
              Annuler
            </Button>
            <Button onClick={handleAddEmployee}>
              Ajouter l'employé
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Génération Bulletin */}
      <Dialog open={showPaySlipGenerator} onOpenChange={setShowPaySlipGenerator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer un bulletin de paie</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employé *</Label>
              <Select value={paySlipData.employeeId} onValueChange={(value) => setPaySlipData({...paySlipData, employeeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(emp => emp.status === 'active').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Période (YYYY-MM) *</Label>
              <Input
                value={paySlipData.period}
                onChange={(e) => setPaySlipData({...paySlipData, period: e.target.value})}
                placeholder="2024-03"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Heures supplémentaires (€)</Label>
                <Input
                  type="number"
                  value={paySlipData.overtime}
                  onChange={(e) => setPaySlipData({...paySlipData, overtime: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Primes (€)</Label>
                <Input
                  type="number"
                  value={paySlipData.bonuses}
                  onChange={(e) => setPaySlipData({...paySlipData, bonuses: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Cotisations (€)</Label>
                <Input
                  type="number"
                  value={paySlipData.deductions}
                  onChange={(e) => setPaySlipData({...paySlipData, deductions: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPaySlipGenerator(false)}>
              Annuler
            </Button>
            <Button onClick={generatePaySlip}>
              Générer le bulletin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRManagement;
