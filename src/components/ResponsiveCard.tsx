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
      <Card className={cn("card-responsive w-full", className)}>
        <CardHeader className="space-y-2 p-3 sm:p-4">
          <div className="loading-skeleton h-4 w-3/4"></div>
          <div className="loading-skeleton h-3 w-1/2"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="loading-skeleton h-8 w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardComponent 
      className={cn(
        "w-full text-left transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md focus-visible:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <Card className="card-responsive h-full w-full">
        <CardHeader className="pb-2 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {Icon && <Icon className="icon-responsive text-primary flex-shrink-0" />}
              <CardTitle className="text-responsive-subtitle truncate">
                {title}
              </CardTitle>
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="text-responsive-caption flex-shrink-0">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-responsive-small text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0 p-3 sm:p-4">
          {value && (
            <div className="text-responsive-title font-bold text-foreground mb-2 truncate">
              {value}
            </div>
          )}
          <div className="text-responsive">
            {children}
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  );
};

export default ResponsiveCard;