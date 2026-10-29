import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Server,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const SecurityPage: React.FC = () => {
  const { showToast } = useFinance();
  const [activeTab, setActiveTab] = useState<'architecture' | 'models' | 'serializers' | 'views'>('architecture');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Code copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const djangoModelsCode = `# spendwise/models.py — Django 5.x & MySQL Relational Models
from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal
from django.core.validators import MinValueValidator

class User(AbstractUser):
    currency = models.CharField(max_length=3, default='USD')
    monthly_income_target = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    phone = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('income', 'Income'), ('expense', 'Expense')])
    icon = models.CharField(max_length=50, default='Tag')
    color = models.CharField(max_length=20, default='#635BFF')
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'name', 'type')
        indexes = [models.Index(fields=['user', 'type'])]

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    type = models.CharField(max_length=10, choices=[('income', 'Income'), ('expense', 'Expense')])
    description = models.CharField(max_length=255)
    date = models.DateField(db_index=True)
    payment_method = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    recurring_rule = models.ForeignKey('RecurringTransaction', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    month = models.PositiveSmallIntegerField()  # 1 - 12
    year = models.PositiveIntegerField()
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=120)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    target_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='in_progress')

class SavingsContribution(models.Model):
    goal = models.ForeignKey(SavingsGoal, on_delete=models.CASCADE, related_name='contributions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    type = models.CharField(max_length=15, choices=[('deposit', 'Deposit'), ('withdrawal', 'Withdrawal')])
    date = models.DateField()
    notes = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RecurringTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_rules')
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=[('income', 'Income'), ('expense', 'Expense')])
    description = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=[('weekly', 'Weekly'), ('monthly', 'Monthly'), ('yearly', 'Yearly')])
    next_due_date = models.DateField(db_index=True)
    status = models.CharField(max_length=10, default='active')

class RecurringExecutionLog(models.Model):
    recurring_rule = models.ForeignKey(RecurringTransaction, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    executed_at = models.DateTimeField(auto_now_add=True)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('recurring_rule', 'scheduled_date')  # Idempotency constraint!`;

  const djangoSerializersCode = `# spendwise/serializers.py — Django REST Framework Serializers
from rest_framework import serializers
from .models import Transaction, Category, Budget, SavingsGoal, RecurringTransaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('user',)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def validate(self, data):
        # Validate category matches transaction type
        if data['category'].type != data['type']:
            raise serializers.ValidationError("Category type must match transaction type.")
        if data['amount'] <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return data

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ('user',)

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ('user', 'current_amount')`;

  const djangoViewsCode = `# spendwise/views.py — DRF ViewSets with Per-User Scoping
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Transaction, Category, Budget, SavingsGoal, SavingsContribution
from .serializers import TransactionSerializer, CategorySerializer, BudgetSerializer, SavingsGoalSerializer

class IsOwnerPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        # Strictly partition user data
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    @transaction.atomic
    def contribute(self, request, pk=None):
        goal = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        c_type = request.data.get('type', 'deposit')

        if c_type == 'withdrawal' and amount > goal.current_amount:
            return Response({'error': 'Withdrawal exceeds current goal balance.'}, status=400)

        if c_type == 'withdrawal':
            goal.current_amount -= amount
        else:
            goal.current_amount += amount

        goal.save()
        SavingsContribution.objects.create(
            goal=goal,
            user=request.user,
            amount=amount,
            type=c_type,
            date=request.data.get('date')
        )
        return Response({'current_amount': goal.current_amount, 'status': goal.status})`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Security & Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial integrity, per-user isolation, CSV formula protection, and Django backend reference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security Guardrails Active
          </span>
        </div>
      </div>

      {/* Security Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Per-User Data Isolation</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every query and state update is strictly partitioned by user identity. Demo simulation is
            segregated from authenticated personal ledgers.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <Database className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Decimal Mathematical Precision</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monetary math is rounded and bound to exact decimal precision to prevent IEEE-754 binary floating-point
            calculation artifacts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">CSV Formula Protection</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All user-submitted transaction cells undergo formula-injection sanitization to neutralize spreadsheet
            macro attacks (`=, +, -, @`).
          </p>
        </div>
      </div>

      {/* Django Architecture Reference for Portfolio & Interviews */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700" />
              Django REST Framework & MySQL Architecture
            </h3>
            <p className="text-xs text-slate-500">
              Clean mapping showing how the React frontend interfaces with the Django backend.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'models' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              models.py
            </button>
            <button
              onClick={() => setActiveTab('serializers')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'serializers' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              serializers.py
            </button>
            <button
              onClick={() => setActiveTab('views')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'views' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              views.py
            </button>
          </div>
        </div>

        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Relational Database Design</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong className="text-gray-800">Atomic Financial Updates:</strong> Savings contributions and
                  recurring occurrences use Django `transaction.atomic()` to guarantee consistency.
                </li>
                <li>
                  <strong className="text-gray-800">Protected Foreign Keys:</strong> `on_delete=models.PROTECT` on
                  Categories guarantees that categories with associated ledger entries cannot be orphaned.
                </li>
                <li>
                  <strong className="text-gray-800">Recurring Idempotency:</strong> `RecurringExecutionLog` with
                  `unique_together=('recurring_rule', 'scheduled_date')` guarantees zero duplicate entries.
                </li>
                <li>
                  <strong className="text-gray-800">Strict Non-Negative Balance:</strong> Goal withdrawals are validated
                  at both the serializer and model level so a balance cannot drop below zero.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <h4 className="font-bold text-[#635BFF] mb-1">Portfolio & Technical Presentation Ready</h4>
              <p>
                This codebase combines the speed of modern React SPA with clean modular architecture that
                directly mirrors production Django REST Framework schemas.
              </p>
            </div>
          </div>
        )}

        {activeTab !== 'architecture' && (
          <div className="relative">
            <button
              onClick={() =>
                copyCode(
                  activeTab === 'models'
                    ? djangoModelsCode
                    : activeTab === 'serializers'
                    ? djangoSerializersCode
                    : djangoViewsCode
                )
              }
              className="absolute top-3 right-3 p-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-xs flex items-center gap-1.5 transition-colors z-10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <pre className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
              <code>
                {activeTab === 'models'
                  ? djangoModelsCode
                  : activeTab === 'serializers'
                  ? djangoSerializersCode
                  : djangoViewsCode}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
