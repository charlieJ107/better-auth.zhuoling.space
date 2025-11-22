'use client';

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    loading = false
}: ConfirmationDialogProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {variant === 'destructive' ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CircleAlert className="h-5 w-5 text-amber-500" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    variant?: 'default' | 'destructive' | 'success';
    buttonText?: string;
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    variant = 'default',
    buttonText = 'OK'
}: AlertDialogProps) {
    const getIcon = () => {
        switch (variant) {
            case 'destructive':
                return <CircleAlert className="h-5 w-5 text-destructive" />;
            case 'success':
                return <CircleAlert className="h-5 w-5 text-green-500" />;
            default:
                return <CircleAlert className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getIcon()}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={() => onOpenChange(false)}
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface SecretDisplayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientName: string;
    clientId: string;
    clientSecret: string;
    onCopy?: () => void;
}

export function SecretDisplayDialog({
    open,
    onOpenChange,
    clientName,
    clientId,
    clientSecret,
    onCopy
}: SecretDisplayDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(clientSecret);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CircleAlert className="h-5 w-5 text-green-500" />
                        New Client Secret Generated
                    </DialogTitle>
                    <DialogDescription>
                        A new secret has been generated for <strong>{clientName}</strong>. The old secret is no longer valid.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This secret will only be shown once. Save it securely.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Client ID</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                                    {clientId}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(clientId)}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Client Secret</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                                    {clientSecret}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
