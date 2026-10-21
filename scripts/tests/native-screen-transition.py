"""Exercise installed NativeProxy Kotlin code without loading its unrelated JNI constructor.

Screen is the Android boundary double: only its UI queue may mutate a view.
The AVD navigation smoke remains the Android integration check.
Requires the project's cached Kotlin 2.1.20 compiler and Java 17.
"""
import glob
import pathlib
import subprocess
import tempfile

root = pathlib.Path(__file__).resolve().parents[2]
cache = pathlib.Path.home() / '.gradle/caches/modules-2/files-2.1'

def jar(group, name, version):
    matches = glob.glob(str(cache / group / name / version / '*' / '*.jar'))
    if len(matches) != 1:
        raise RuntimeError(f'Expected one cached {name} {version}; found {len(matches)}')
    return matches[0]

stdlib = jar('org.jetbrains.kotlin', 'kotlin-stdlib', '2.1.20')
compiler = [jar('org.jetbrains.kotlin', name, '2.1.20') for name in (
    'kotlin-compiler-embeddable', 'kotlin-script-runtime', 'kotlin-daemon-embeddable')]
compiler += [stdlib, jar('org.jetbrains.kotlinx', 'kotlinx-coroutines-core-jvm', '1.8.0')]
annotations = jar('org.jetbrains', 'annotations', '13.0')
compiler += [annotations, jar('org.jetbrains.intellij.deps', 'trove4j', '1.0.20200330')]
java = '/usr/lib/jvm/java-17-openjdk-amd64/bin/java'
sources = {
    'Log.kt': 'package android.util\nobject Log { fun w(tag: String, message: String): Int = 0 }',
    'HybridData.kt': 'package com.facebook.jni\nclass HybridData',
    'DoNotStrip.kt': 'package com.facebook.proguard.annotations\nannotation class DoNotStrip',
    'FabricUIManager.kt': 'package com.facebook.react.fabric\nclass FabricUIManager',
    'Screen.kt': '''package com.swmansion.rnscreens
import java.util.concurrent.ConcurrentLinkedQueue
class Screen {
    val uiThread = Thread.currentThread()
    val pending = ConcurrentLinkedQueue<Runnable>()
    var transitions = 0
    fun post(action: Runnable): Boolean { pending.add(action); return true }
    fun startRemovalTransition() {
        check(Thread.currentThread() === uiThread) { "View changed off the UI thread" }
        transitions++
    }
    fun drainUI() { while (pending.isNotEmpty()) pending.remove().run() }
}
''',
    'Main.kt': '''package com.swmansion.rnscreens
import java.util.concurrent.atomic.AtomicReference
import sun.misc.Unsafe
fun main() {
    // The tested callback does not use mHybridData. Avoid loading Android JNI here.
    val field = Unsafe::class.java.getDeclaredField("theUnsafe").apply { isAccessible = true }
    val proxy = (field.get(null) as Unsafe).allocateInstance(NativeProxy::class.java) as NativeProxy
    val screen = Screen()
    NativeProxy.addScreenToMap(11, screen)
    val failure = AtomicReference<Throwable?>()
    val worker = Thread {
        try { proxy.notifyScreenRemoved(11) } catch (error: Throwable) { failure.set(error) }
    }
    worker.start(); worker.join()
    check(failure.get() == null) { "Background callback touched a view: ${failure.get()}" }
    check(screen.transitions == 0) { "Transition ran before the UI queue" }
    screen.drainUI()
    check(screen.transitions == 1) { "UI queue must start the removal transition" }
    NativeProxy.removeScreenFromMap(11)
    proxy.notifyScreenRemoved(11)
    proxy.notifyScreenRemoved(404)
    screen.drainUI()
    check(screen.transitions == 1) { "Removed/unknown screens must be ignored" }
    println("PASS: background removal dispatches to UI; removed/unknown tags ignored")
}
''',
}
with tempfile.TemporaryDirectory(prefix='manager-screen-test-') as folder:
    temp = pathlib.Path(folder)
    for name, source in sources.items():
        (temp / name).write_text(source)
    target = root / 'node_modules/react-native-screens/android/src/fabric/java/com/swmansion/rnscreens/NativeProxy.kt'
    (temp / 'NativeProxy.kt').write_bytes(target.read_bytes())
    output = temp / 'classes'
    subprocess.run([java, '-Xmx512m', '-cp', ':'.join(compiler),
                    'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect',
                    '-classpath', ':'.join([stdlib, annotations]), '-d', str(output),
                    *map(str, temp.glob('*.kt'))], check=True)
    subprocess.run([java, '-cp', f'{output}:{stdlib}', 'com.swmansion.rnscreens.MainKt'], check=True)
