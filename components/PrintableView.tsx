
import React from 'react';
import { Day } from '../types';

interface PrintableViewProps {
    weekMenu: Day[];
    startDate: Date | null;
    t: (key: string) => string;
}

const PrintableView: React.FC<PrintableViewProps> = ({ weekMenu, startDate, t }) => {
    if (!startDate) return null;

    const formatFullDate = (date: Date) => {
        // Use t for date formatting locale if needed, or navigator.language
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return (
        <div id="printable-area" className="hidden print:block font-sans text-black bg-white p-2">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold">{t('app_title')}</h1>
                <h2 className="text-xl">{formatFullDate(startDate)} - {formatFullDate(endDate)}</h2>
            </header>
            
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr>
                        <th className="border border-black p-2 w-[10%]"></th>
                        <th className="border border-black p-2">{t('breakfast')}</th>
                        <th className="border border-black p-2">{t('lunch')}</th>
                        <th className="border border-black p-2">{t('dinner')}</th>
                    </tr>
                </thead>
                <tbody>
                    {weekMenu.map((day, dayIndex) => {
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + dayIndex);
                        const dateNum = currentDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
                        return (
                            <tr key={day.name} className="break-inside-avoid">
                                <td className="border border-black p-2 align-top text-center font-bold">
                                    {day.name}
                                    <br />
                                    <span className="font-normal text-sm">{dateNum}</span>
                                </td>
                                {day.meals.map(meal => (
                                    <td key={meal.name} className="border border-black p-2 align-top">
                                        {meal.subMeals.map(subMeal => (
                                            <div key={subMeal.id} className="mb-2 last:mb-0">
                                                <p className="text-sm font-semibold underline">{subMeal.name}</p>
                                                <p className="text-sm pl-2">
                                                    {subMeal.dish ? subMeal.dish.name : '-'}
                                                </p>
                                            </div>
                                        ))}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PrintableView;
