'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog';
import { Download, Upload, FileJson, FileText } from 'lucide-react';
import { exportCanvas, importCanvas, type CanvasExport } from '@/app/lib/db/repository';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

interface ExportDialogProps {
  canvasId: string;
  canvasName: string;
  nodes?: Node[];
  edges?: Edge[];
}

export function ExportDialog({ canvasId, canvasName, nodes, edges }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportCanvas(canvasId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${canvasName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Canvas exported as JSON');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export canvas');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const markdown = convertToMarkdown(nodes || [], edges || [], canvasName);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${canvasName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Canvas exported as Markdown');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export canvas');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data: CanvasExport = JSON.parse(text);
      await importCanvas(data);
      toast.success('Canvas imported successfully');
      // Reload page to show new canvas
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import canvas');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export / Import Canvas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Export</h4>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleExportJSON}
                disabled={isExporting}
              >
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleExportMarkdown}
                disabled={isExporting || !nodes}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as Markdown
              </Button>
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Import</h4>
            <label htmlFor="import-file">
              <Button
                className="w-full"
                variant="outline"
                disabled={isImporting}
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Import from JSON
                </span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function convertToMarkdown(nodes: Node[], edges: Edge[], canvasName: string): string {
  let md = `# ${canvasName}\n\n`;
  md += `_Exported on ${new Date().toLocaleDateString()}_\n\n`;
  md += `---\n\n`;

  // Group nodes by type
  const nodesByType = nodes.reduce((acc, node) => {
    const type = node.type || 'default';
    if (!acc[type]) acc[type] = [];
    acc[type].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  // Export each type
  for (const [type, typeNodes] of Object.entries(nodesByType)) {
    md += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Nodes\n\n`;

    for (const node of typeNodes) {
      md += `### ${node.data.label || 'Untitled'}\n\n`;
      if (node.data.content) {
        md += `${node.data.content}\n\n`;
      }

      // Find connected nodes
      const connections = edges.filter(e => e.source === node.id || e.target === node.id);
      if (connections.length > 0) {
        md += `**Connections:**\n`;
        for (const edge of connections) {
          const isSource = edge.source === node.id;
          const otherNodeId = isSource ? edge.target : edge.source;
          const otherNode = nodes.find(n => n.id === otherNodeId);
          if (otherNode) {
            md += `- ${isSource ? '→' : '←'} ${otherNode.data.label || 'Untitled'}\n`;
          }
        }
        md += '\n';
      }

      md += `---\n\n`;
    }
  }

  return md;
}
