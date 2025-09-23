import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  actions?: (item: any) => React.ReactNode;
  onRowClick?: (item: any) => void;
  mobileCardRender?: (item: any) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ResponsiveTable = ({
  columns,
  data,
  title,
  actions,
  onRowClick,
  mobileCardRender,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  className
}: ResponsiveTableProps) => {
  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle className="text-responsive-subtitle">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="loading-skeleton h-12 w-full rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle className="text-responsive-subtitle">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-responsive">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop table view
  const DesktopTable = () => (
    <Card className="hidden md:block">
      {title && (
        <CardHeader>
          <CardTitle className="text-responsive-subtitle">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="mobile-friendly-table">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
                {actions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow 
                  key={index}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {actions(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Mobile cards view
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {title && (
        <h3 className="text-responsive-subtitle font-semibold">{title}</h3>
      )}
      {data.map((item, index) => (
        <Card 
          key={index}
          className={cn(
            "p-4 transition-all duration-200",
            onRowClick && "cursor-pointer hover:shadow-md active:scale-95"
          )}
          onClick={() => onRowClick?.(item)}
        >
          {mobileCardRender ? mobileCardRender(item) : (
            <div className="space-y-2">
              {columns.slice(0, 3).map((col) => (
                <div key={col.key} className="flex justify-between items-center">
                  <span className="text-responsive-small text-muted-foreground font-medium">
                    {col.label}:
                  </span>
                  <span className="text-responsive-small font-medium">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="flex justify-end gap-2 pt-2 border-t">
                  {actions(item)}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className={className}>
      <DesktopTable />
      <MobileCards />
    </div>
  );
};

export default ResponsiveTable;