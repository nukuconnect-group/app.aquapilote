
import React, { useState } from 'react';
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
  const { units } = useProductionUnits();

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@aqua-ferme.fr',
      phone: '06.12.34.56.78',
      position: 'Responsable Grossissement',
      unitId: 'GROSS001',
      unitName: 'Unité de Grossissement A',
      salary: 2800,
      hireDate: '2023-03-15',
      status: 'active',
      contractType: 'CDI'
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@aqua-ferme.fr',
      phone: '06.87.65.43.21',
      position: 'Technicienne Écloserie',
      unitId: 'ECLO001',
      unitName: 'Écloserie Principale',
      salary: 2200,
      hireDate: '2023-06-01',
      status: 'active',
      contractType: 'CDI'
    },
    {
      id: '3',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@aqua-ferme.fr',
      phone: '06.55.44.33.22',
      position: 'Ouvrier Aquacole',
      unitId: 'GROSS001',
      unitName: 'Unité de Grossissement A',
      salary: 1800,
      hireDate: '2024-01-10',
      status: 'active',
      contractType: 'CDD'
    }
  ]);

  const [paySlips, setPaySlips] = useState<PaySlip[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Jean Martin',
      period: '2024-03',
      baseSalary: 2800,
      overtime: 200,
      bonuses: 150,
      deductions: 680,
      netSalary: 2470,
      generatedAt: '2024-03-31'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Marie Dubois',
      period: '2024-03',
      baseSalary: 2200,
      overtime: 0,
      bonuses: 100,
      deductions: 530,
      netSalary: 1770,
      generatedAt: '2024-03-31'
    }
  ]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPaySlipGenerator, setShowPaySlipGenerator] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    unitId: '',
    salary: 0,
    hireDate: '',
    contractType: 'CDI' as 'CDI' | 'CDD' | 'Stage' | 'Freelance'
  });

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
                <td>€${paySlip.baseSalary.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Heures supplémentaires</td>
                <td>€${paySlip.overtime.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Primes</td>
                <td>€${paySlip.bonuses.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Cotisations sociales</td>
                <td>-€${paySlip.deductions.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td><strong>SALAIRE NET</strong></td>
                <td><strong>€${paySlip.netSalary.toFixed(2)}</strong></td>
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
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0),
    avgSalary: employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestion des Ressources Humaines</h2>
              <p className="text-blue-100">Personnel, paie et administration RH</p>
            </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => setShowPaySlipGenerator(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Générer Bulletin
            </Button>
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => setShowEmployeeForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Employé
            </Button>
          </div>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      {/* KPIs RH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{hrStats.totalEmployees}</p>
                <p className="text-sm text-gray-600">Employés total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{hrStats.activeEmployees}</p>
                <p className="text-sm text-gray-600">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">€{hrStats.totalPayroll.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Masse salariale</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">€{Math.round(hrStats.avgSalary)}</p>
                <p className="text-sm text-gray-600">Salaire moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="payroll">Bulletins de Paie</TabsTrigger>
          <TabsTrigger value="reports">Rapports RH</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Employés</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Salaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Contrat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {employee.unitName}
                        </Badge>
                      </TableCell>
                      <TableCell>€{employee.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status === 'active' ? 'Actif' : 
                           employee.status === 'inactive' ? 'Inactif' : 'Congés'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{employee.contractType}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Bulletins de Paie</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {paySlips.map((paySlip) => (
                    <TableRow key={paySlip.id}>
                      <TableCell>{paySlip.employeeName}</TableCell>
                      <TableCell>{paySlip.period}</TableCell>
                      <TableCell>€{paySlip.baseSalary}</TableCell>
                      <TableCell>€{paySlip.overtime}</TableCell>
                      <TableCell>€{paySlip.bonuses}</TableCell>
                      <TableCell>€{paySlip.deductions}</TableCell>
                      <TableCell className="font-bold">€{paySlip.netSalary}</TableCell>
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
                            €{unitEmployees.reduce((sum, emp) => sum + emp.salary, 0).toLocaleString()}/mois
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
