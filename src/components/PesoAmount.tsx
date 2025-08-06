const PesoAmount = ({ className, amount }: { className?: string; amount: number }) => {
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

  return <span className={className}>{formattedAmount}</span>;
};

export default PesoAmount;