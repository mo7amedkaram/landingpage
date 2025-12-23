'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Heart, Bandage, Stethoscope, Calendar } from 'lucide-react';

const trainingDays = [
    {
        day: 'اليوم الأول',
        title: 'إنقاذ الحياة والطوارئ',
        description: 'تعلم تقنيات الإنعاش القلبي الرئوي (CPR)، دعم الحياة الأساسي (BLS)، والتعامل مع حالات الاختناق',
        icon: Heart,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500',
    },
    {
        day: 'اليوم الثاني',
        title: 'الجروح والإصابات',
        description: 'إيقاف النزيف، التعامل مع الكسور، تطبيق الجبائر والضمادات بشكل صحيح',
        icon: Bandage,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500',
    },
    {
        day: 'اليوم الثالث',
        title: 'المهارات التمريضية',
        description: 'تقنيات الحقن العضلي والوريدي، تركيب الكانيولا، قياس العلامات الحيوية',
        icon: Stethoscope,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

export function ValueStackSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>برنامج التدريب</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        ماذا ستتعلم في <span className="text-blue-600">3 أيام</span>؟
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        برنامج تدريبي شامل يغطي جميع المهارات الأساسية للإسعافات الأولية والتمريض
                    </p>
                </motion.div>

                {/* Training Day Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
                >
                    {trainingDays.map((day, index) => {
                        const Icon = day.icon;
                        return (
                            <motion.div key={index} variants={cardVariants}>
                                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-t-4 border-transparent hover:border-t-blue-500 overflow-hidden group">
                                    <CardHeader className="pb-4">
                                        <div className={`w-14 h-14 rounded-xl ${day.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`w-7 h-7 ${day.iconColor}`} />
                                        </div>
                                        <span className={`text-sm font-bold bg-gradient-to-l ${day.color} text-transparent bg-clip-text`}>
                                            {day.day}
                                        </span>
                                        <CardTitle className="text-xl mt-1">{day.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed">{day.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
