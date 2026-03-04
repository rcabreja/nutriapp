import React from 'react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const Input = ({ label, value, onChange, type = "text" }: any) => (
    <div>
        <label className="block text-xs font-bold text-[#3c584b] mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2 text-[#3c584b] text-sm focus:border-[#cbd9ce] outline-none transition-colors"
        />
    </div>
);

export default function StepBasicInfo({ formData, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-[#fdf7e7] p-4 md:p-5 rounded-xl border border-[#cbd9ce]">
                <h4 className="text-[#3c584b] font-bold mb-4 border-b border-[#cbd9ce] pb-2">Datos Personales</h4>
                <div className="space-y-4">
                    <Input label="Nombre Completo" value={formData.name} onChange={(v: any) => onChange('name', v)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Fecha Nac." type="date" value={formData.dob} onChange={(v: any) => onChange('dob', v)} />
                        <div>
                            <label className="block text-xs font-bold text-[#3c584b] mb-1">Sexo</label>
                            <select 
                                value={formData.gender} 
                                onChange={e => onChange('gender', e.target.value)}
                                className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2 text-[#3c584b] text-sm focus:border-[#cbd9ce] outline-none"
                            >
                                <option value="F">Femenino</option>
                                <option value="M">Masculino</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Estado Civil" value={formData.maritalStatus} onChange={(v: any) => onChange('maritalStatus', v)} />
                        <Input label="Ocupación" value={formData.occupation} onChange={(v: any) => onChange('occupation', v)} />
                    </div>
                    <Input label="Dirección" value={formData.address} onChange={(v: any) => onChange('address', v)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Teléfono" value={formData.phone} onChange={(v: any) => onChange('phone', v)} />
                        <Input label="Email" type="email" value={formData.email} onChange={(v: any) => onChange('email', v)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#3c584b] mb-1">Motivo Consulta</label>
                        <textarea 
                            value={formData.motive}
                            onChange={e => onChange('motive', e.target.value)}
                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2 text-[#3c584b] text-sm h-20 resize-none focus:border-[#cbd9ce] outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
