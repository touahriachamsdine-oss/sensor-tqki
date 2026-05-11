
'use client';

import { useState, useMemo } from 'react';
import { useSensorData } from '@/hooks/use-sensor-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DatePickerWithRange } from '@/components/history/date-picker-range';
import type { ObjectPosition } from '@/types';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';

export default function HistoryClientPage() {
  const { history } = useSensorData();
  const { dictionary } = useDictionary();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (!date) return true;
      const itemDate = new Date(item.timestamp);
      if (date.from && itemDate < date.from) return false;
      // Set to end of day for 'to' date
      if (date.to) {
        const toDate = new Date(date.to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }
      return true;
    });
  }, [history, date]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.history.title}</h1>
        <p className="text-muted-foreground">{dictionary.history.description}</p>
      </div>
      <Card className="border-4 border-foreground shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>{dictionary.history.cardTitle}</CardTitle>
          <DatePickerWithRange date={date} setDate={setDate} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dictionary.history.timestamp}</TableHead>
                  <TableHead className="text-right">{dictionary.history.x}</TableHead>
                  <TableHead className="text-right">{dictionary.history.y}</TableHead>
                  <TableHead className="text-right">{dictionary.history.z}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((item: ObjectPosition) => (
                    <TableRow key={item.timestamp}>
                      <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.position.x.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{item.position.y.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{item.position.z.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {dictionary.history.noData}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {dictionary.history.pageInfo.replace('{page}', String(currentPage)).replace('{total}', String(totalPages))}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {dictionary.history.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  {dictionary.history.next}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
