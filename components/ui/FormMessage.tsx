interface FormMessageProps {
  error?: string;
  success?: string;
}

export function FormMessage({ error, success }: FormMessageProps) {
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="text-sm text-forest bg-forest/5 border border-forest/20 rounded-lg px-4 py-3">
        {success}
      </p>
    );
  }
  return null;
}
