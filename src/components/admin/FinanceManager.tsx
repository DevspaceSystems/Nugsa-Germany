import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CreditCard, DollarSign } from "lucide-react";

interface FinanceSettings {
    bank_transfer_details: {
        bank_name: string;
        account_name: string;
        account_number: string;
        swift_code: string;
        upi_id: string;
    };
    mobile_money_details: {
        provider: string;
        number: string;
        name: string;
    };
    contact_details: {
        treasurer_name: string;
        treasurer_email: string;
        treasurer_phone: string;
        finance_email: string;
    };
}

export function FinanceManager() {
    const [loading, setLoading] = useState(false);
    const [financeSettings, setFinanceSettings] = useState<FinanceSettings>({
        bank_transfer_details: {
            bank_name: "",
            account_name: "",
            account_number: "",
            swift_code: "",
            upi_id: ""
        },
        mobile_money_details: {
            provider: "",
            number: "",
            name: ""
        },
        contact_details: {
            treasurer_name: "",
            treasurer_email: "",
            treasurer_phone: "",
            finance_email: ""
        }
    });

    useEffect(() => {
        fetchFinanceSettings();
    }, []);

    const fetchFinanceSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('organization_settings')
                .select('*');

            if (error) throw error;

            const settings: FinanceSettings = {
                bank_transfer_details: {
                    bank_name: "",
                    account_name: "",
                    account_number: "",
                    swift_code: "",
                    upi_id: ""
                },
                mobile_money_details: {
                    provider: "",
                    number: "",
                    name: ""
                },
                contact_details: {
                    treasurer_name: "",
                    treasurer_email: "",
                    treasurer_phone: "",
                    finance_email: ""
                }
            };

            data?.forEach(setting => {
                try {
                    const val = typeof setting.setting_value === "string"
                        ? JSON.parse(setting.setting_value)
                        : setting.setting_value;

                    if (val && typeof val === 'object') {
                        if (setting.setting_key === 'bank_transfer_details') {
                            settings.bank_transfer_details = { ...settings.bank_transfer_details, ...val };
                        } else if (setting.setting_key === 'mobile_money_details') {
                            settings.mobile_money_details = { ...settings.mobile_money_details, ...val };
                        } else if (setting.setting_key === 'contact_details') {
                            settings.contact_details = { ...settings.contact_details, ...val };
                        }
                    }
                } catch (e) {
                    console.error(`Error parsing setting ${setting.setting_key}`, e);
                }
            });

            setFinanceSettings(settings);
        } catch (error) {
            console.error('Error fetching finance settings:', error);
            toast({
                title: "Error",
                description: "Failed to load finance settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFinanceUpdate = async (settingKey: keyof FinanceSettings) => {
        try {
            const { error } = await supabase
                .from('organization_settings')
                .upsert({
                    setting_key: settingKey,
                    setting_value: financeSettings[settingKey]
                }, {
                    onConflict: 'setting_key'
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Finance settings updated successfully",
            });
            fetchFinanceSettings();
        } catch (error) {
            console.error('Error updating finance settings:', error);
            toast({
                title: "Error",
                description: "Failed to update finance settings",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Bank Transfer Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Bank Name</Label>
                            <Input
                                value={financeSettings.bank_transfer_details.bank_name}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    bank_transfer_details: { ...financeSettings.bank_transfer_details, bank_name: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <Label>Account Name</Label>
                            <Input
                                value={financeSettings.bank_transfer_details.account_name}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    bank_transfer_details: { ...financeSettings.bank_transfer_details, account_name: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <Label>Account Number/IBAN</Label>
                            <Input
                                value={financeSettings.bank_transfer_details.account_number}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    bank_transfer_details: { ...financeSettings.bank_transfer_details, account_number: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <Label>BIC/SWIFT Code</Label>
                            <Input
                                value={financeSettings.bank_transfer_details.swift_code}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    bank_transfer_details: { ...financeSettings.bank_transfer_details, swift_code: e.target.value }
                                })}
                            />
                        </div>
                        <Button onClick={() => handleFinanceUpdate('bank_transfer_details')}>
                            Save Bank Details
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Treasurer Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Treasurer Name</Label>
                            <Input
                                value={financeSettings.contact_details.treasurer_name}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    contact_details: { ...financeSettings.contact_details, treasurer_name: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <Label>Treasurer Email</Label>
                            <Input
                                value={financeSettings.contact_details.treasurer_email}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    contact_details: { ...financeSettings.contact_details, treasurer_email: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <Label>Finance Support Email</Label>
                            <Input
                                value={financeSettings.contact_details.finance_email}
                                onChange={(e) => setFinanceSettings({
                                    ...financeSettings,
                                    contact_details: { ...financeSettings.contact_details, finance_email: e.target.value }
                                })}
                            />
                        </div>
                        <Button onClick={() => handleFinanceUpdate('contact_details')}>
                            Save Contact Details
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
