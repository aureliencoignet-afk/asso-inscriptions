import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationById } from '@/lib/actions/registrations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return new NextResponse('ID manquant', { status: 400 })
    }

    const registration = await getRegistrationById(id)
    
    if (!registration) {
      return new NextResponse('Inscription non trouvée', { status: 404 })
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    }

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    const cotisationLine = registration.lines?.find((l: any) => l.line_type === 'COTISATION')
    const activityLines = registration.lines?.filter((l: any) => l.line_type === 'ACTIVITE') || []

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription ${registration.registration_number}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item {
            padding: 10px;
            background: #f9fafb;
            border-radius: 5px;
        }
        .info-item label {
            font-weight: bold;
            color: #6b7280;
            font-size: 12px;
            display: block;
            margin-bottom: 5px;
        }
        .info-item value {
            color: #111827;
        }
        .line-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            margin-bottom: 10px;
        }
        .line-item.cotisation {
            background: #f0f9ff;
            border-color: #2563eb;
        }
        .total {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: #2563eb;
            color: white;
            border-radius: 5px;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
        }
        .installment {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        .installment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .payment-detail {
            background: #f9fafb;
            padding: 10px;
            border-radius: 3px;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-validated {
            background: #dcfce7;
            color: #166534;
        }
        .status-draft {
            background: #f3f4f6;
            color: #374151;
        }
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Récapitulatif d'Inscription</h1>
        <p>N° ${registration.registration_number}</p>
        <span class="status-badge status-${registration.status}">
            ${registration.status === 'validated' ? 'Validée' : 
              registration.status === 'cancelled' ? 'Annulée' : 'Brouillon'}
        </span>
    </div>

    <div class="section">
        <h2>Informations de l'abonné</h2>
        <div class="info-grid">
            <div class="info-item">
                <label>Nom complet</label>
                <value>${registration.subscriber.firstname} ${registration.subscriber.lastname}</value>
            </div>
            <div class="info-item">
                <label>Date de naissance</label>
                <value>${registration.subscriber.date_of_birth ? formatDate(registration.subscriber.date_of_birth) : '-'}</value>
            </div>
            ${registration.subscriber.household ? `
            <div class="info-item">
                <label>Foyer</label>
                <value>${registration.subscriber.household.name}</value>
            </div>
            ` : ''}
            <div class="info-item">
                <label>Saison</label>
                <value>${registration.season.label}</value>
            </div>
            <div class="info-item">
                <label>Date d'inscription</label>
                <value>${formatDate(registration.registration_date)}</value>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Détail de l'inscription</h2>
        ${cotisationLine ? `
        <div class="line-item cotisation">
            <div>
                <strong>Cotisation annuelle</strong><br>
                <small style="color: #6b7280;">Obligatoire</small>
            </div>
            <div style="font-weight: bold; font-size: 16px;">${formatCurrency(cotisationLine.amount)}</div>
        </div>
        ` : ''}
        
        ${activityLines.length > 0 ? `
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: #6b7280; font-size: 14px;">Activités</h3>
        ${activityLines.map((line: any) => `
        <div class="line-item">
            <div>
                <strong>${line.activity?.name || line.label}</strong>
                ${line.activity?.description ? `<br><small style="color: #6b7280;">${line.activity.description}</small>` : ''}
            </div>
            <div style="font-weight: bold;">${formatCurrency(line.amount)}</div>
        </div>
        `).join('')}
        ` : ''}

        <div class="total">
            <span>TOTAL</span>
            <span>${formatCurrency(registration.total_net)}</span>
        </div>
    </div>

    <div class="section">
        <h2>Échéancier de paiement</h2>
        <p style="color: #6b7280; margin-bottom: 15px;">${registration.installments.length} échéance(s)</p>
        
        ${registration.installments.map((installment: any) => `
        <div class="installment">
            <div class="installment-header">
                <div>
                    <strong>Échéance ${installment.rank}</strong><br>
                    <small style="color: #6b7280;">Date d'échéance : ${formatDate(installment.due_date)}</small>
                </div>
                <div style="font-weight: bold; font-size: 16px;">${formatCurrency(installment.amount)}</div>
            </div>
            ${installment.planned_payments.map((payment: any) => `
            <div class="payment-detail">
                <strong>${payment.payment_mode}</strong>
                ${payment.check_number ? ` - Chèque n° ${payment.check_number}` : ''}
                ${payment.bank_name ? ` - ${payment.bank_name}` : ''}
                ${payment.reference ? ` - Réf: ${payment.reference}` : ''}
                <span style="float: right;">${formatCurrency(payment.amount)}</span>
            </div>
            `).join('')}
        </div>
        `).join('')}
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Document généré le ${formatDate(new Date().toISOString())}</p>
        <p>Merci de conserver ce document</p>
    </div>

    <script>
        window.print();
    </script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Erreur PDF:', error)
    return new NextResponse('Erreur lors de la génération du PDF', { status: 500 })
  }
}
