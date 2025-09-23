import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

const ResponsiveCard = ({
  title,
  subtitle,
  value,
  icon: Icon,
  badge,
  badgeVariant = "default",
  children,
  className,
  onClick,
  loading = false
}: ResponsiveCardProps) => {
  const CardComponent = onClick ? 'button' : 'div';

  if (loading) {
    return (
      <Card className={cn("card-responsive", className)}>
        <CardHeader className="space-y-2">
          <div className="loading-skeleton h-4 w-3/4"></div>
          <div className="loading-skeleton h-3 w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="loading-skeleton h-8 w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardComponent 
      className={cn(
        "w-full text-left transition-all duration-200",
        onClick && "cursor-pointer hover:scale-105 focus-visible:scale-105",
        className
      )}
      onClick={onClick}
    >
      <Card className="card-responsive h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-responsive flex items-center gap-2">
              {Icon && <Icon className="icon-responsive text-primary" />}
              <span className="truncate">{title}</span>
            </CardTitle>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-responsive-small text-muted-foreground">
              {subtitle}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-2">
          {value && (
            <div className="text-responsive-title font-bold text-foreground mb-2">
              {value}
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </CardComponent>
  );
};

export default ResponsiveCard;