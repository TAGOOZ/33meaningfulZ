import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onClose: () => void;
}

export default function AboutPage({ onClose }: AboutPageProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 py-12">
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 text-center mb-8">
            🌿 تدبر الذكر 🌿
          </h1>

          <section className="space-y-6 text-gray-700 dark:text-gray-200">
            <div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                📖 وصف التطبيق
              </h2>
              <p className="leading-relaxed font-arabic">
                تطبيق "تدبر الذكر" هو رفيقك الروحي الذي يعينك على ذكر الله تعالى بتدبر وتأمل. ✨ يتيح لك التسبيح، التحميد، والتكبير بطريقة تفاعلية، مع عرض عبارات متنوعة تساعدك على استحضار عظمة الله والتفكر في معاني الذكر. 🤲💖
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                🔹 مميزات التطبيق
              </h2>
              <ul className="space-y-2 font-arabic">
                <li>✅ وضع العد التقليدي: يتيح لك التسبيح، التحميد، والتكبير كل منها 33 مرة، مع عرض عبارات ملهمة في كل مرة. 📿</li>
                <li>✅ وضع العد اللانهائي: يمكنك من الاستمرار في الذكر دون حد، مع تنوع العبارات لتجديد التأمل. 🔄</li>
                <li>✅ عبارات تدبرية: يقدم التطبيق عبارات مستوحاة من معاني الذكر، لتعميق التفكر والتدبر. 🕌</li>
                <li>✅ إحصائيات الذكر: تتبع تقدمك في الذكر يوميًا وأسبوعيًا، لتشجيعك على الاستمرار. 📊</li>
                <li>✅ تنبيهات يومية: تذكيرك بأوقات الذكر لتبقى على صلة دائمة بالله. ⏰</li>
                <li>✅ وضع ليلي: تصميم مريح للعين للاستخدام الليلي. 🌙</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                📝 طريقة الاستخدام
              </h2>
              <ol className="space-y-2 font-arabic list-decimal list-inside">
                <li>اختر وضع الذكر المناسب لك: العد التقليدي أو اللانهائي.</li>
                <li>اضغط على الزر المخصص مع كل ذكر، وستظهر لك عبارات تدبرية مختلفة. 💬</li>
                <li>تابع تقدمك من خلال الإحصائيات المتاحة. 📈</li>
                <li>استفد من التنبيهات اليومية لتذكيرك بأوقات الذكر. 🔔</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                🤲 هدف التطبيق
              </h2>
              <p className="leading-relaxed font-arabic">
                يهدف "تدبر الذكر" إلى تعزيز صلتك بالله من خلال الذكر المتأمل، وتقديم تجربة روحانية تعينك على استحضار معاني التسبيح، التحميد، والتكبير، مستندًا إلى قول الله تعالى:
              </p>
              <p className="text-center my-4 text-lg font-arabic text-emerald-700 dark:text-emerald-300">
                💖 "ألا بذكر الله تطمئن القلوب" 💖
              </p>
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-arabic">
                [الرعد: 28]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
